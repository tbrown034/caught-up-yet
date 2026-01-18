// Admin utility functions
// Admin emails are configured via ADMIN_EMAILS environment variable
// Format: comma-separated list (e.g., "admin1@example.com,admin2@example.com")

function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  if (!adminEmailsEnv) return [];
  return adminEmailsEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}
