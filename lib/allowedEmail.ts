export function isAllowedEmail(email: string) {
  const domain = process.env.ALLOWED_EMAIL_DOMAIN!.toLowerCase();
  return email.trim().toLowerCase().endsWith(`@${domain}`);
}