/** Detect PostgREST/Supabase errors caused by selecting columns that are not in the schema yet. */
export function isMissingColumnError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;

  const e = err as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };

  const blob = `${e.message ?? ''} ${e.details ?? ''} ${e.hint ?? ''} ${e.code ?? ''}`.toLowerCase();

  return (
    e.code === '42703' ||
    e.code === 'PGRST204' ||
    blob.includes('full_name') ||
    blob.includes('employee_id') ||
    blob.includes('does not exist') ||
    blob.includes('schema cache') ||
    blob.includes('could not find') ||
    (blob.includes('column') && blob.includes('profiles'))
  );
}
