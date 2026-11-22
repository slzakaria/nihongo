// Single source of truth for who gets the admin dashboard in /profile. Checked both client-side
// (to decide whether to render/fetch the admin section at all) and server-side in the API route
// itself, which is the actual security boundary — the client check is only for UX, since the route
// re-derives the caller's email from their verified Clerk session, never trusting client input.
export const ADMIN_EMAIL = 'slzackaria@gmail.com';

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
