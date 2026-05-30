import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types';

export interface AuthContextValue {
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
