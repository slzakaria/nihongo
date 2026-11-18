// Phone (SMS) sign-in and phone changes are hidden while they are being fixed. Set to true to bring them back.
export const PHONE_AUTH_ENABLED = false

// Accepts common typing (spaces, dashes, brackets) and returns E.164 (+ followed by up to 15 digits), or null
export function normalizePhone(input: string): string | null {
  const compact = input.replace(/[\s\-().]/g, '')
  return /^\+[1-9]\d{6,14}$/.test(compact) ? compact : null
}
