import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  initializing: boolean;
  signingIn: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserRole>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

function profileErrorMessage(err: unknown): string {
  const msg = getErrorMessage(err).toLowerCase();

  if (msg.includes('permission denied') || msg.includes('42501')) {
    return 'Database access denied. Run supabase/fix-profile-access.sql in the Supabase SQL Editor.';
  }
  if (msg.includes('infinite recursion')) {
    return 'Database policy error. Run supabase/fix-profile-access.sql in the Supabase SQL Editor.';
  }
  if (
    msg.includes('no profile found') ||
    msg.includes('0 rows') ||
    msg.includes('not found')
  ) {
    return 'No profile found for this account. Run step 5 in supabase/fix-profile-access.sql to create your profile row.';
  }

  return getErrorMessage(err);
}

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('No profile found for this account.');
  }
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearStaleSession = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const loadProfile = useCallback(async (userId: string): Promise<Profile> => {
    const p = await fetchProfile(userId);
    setProfile(p);
    setError(null);
    return p;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!mounted) return;

        setSession(data.session);
        if (data.session?.user) {
          try {
            await loadProfile(data.session.user.id);
          } catch (err) {
            setProfile(null);
            setError(profileErrorMessage(err));
            await clearStaleSession();
          }
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to initialize auth.'
          );
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setInitializing(false);

      if (newSession?.user) {
        // Defer async work — async callbacks here can deadlock signInWithPassword
        window.setTimeout(() => {
          if (!mounted) return;
          void loadProfile(newSession.user!.id).catch((err) => {
            if (!mounted) return;
            setProfile(null);
            setError(profileErrorMessage(err));
          });
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, clearStaleSession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<UserRole> => {
      setError(null);
      setSigningIn(true);
      try {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (!data.session || !data.user) {
          throw new Error('Sign in succeeded but no session was returned.');
        }

        setSession(data.session);

        let p: Profile;
        try {
          p = await loadProfile(data.user.id);
        } catch (err) {
          await clearStaleSession();
          const message = profileErrorMessage(err);
          setError(message);
          throw new Error(message);
        }

        return p.role;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Sign in failed.';
        setError(message);
        throw err;
      } finally {
        setSigningIn(false);
      }
    },
    [loadProfile, clearStaleSession]
  );

  const signOut = useCallback(async () => {
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setProfile(null);
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed.');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      session,
      profile,
      role: profile?.role ?? null,
      initializing,
      signingIn,
      error,
      signIn,
      signOut,
      clearError,
    }),
    [session, profile, initializing, signingIn, error, signIn, signOut, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
