// Share code generation and validation utilities

/**
 * Generate a random 6-character share code
 * Uses uppercase letters and numbers, excluding confusing characters (I, O, 0, 1)
 * Example: "BEARS7", "PACK3R"
 */
export function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1
  let code = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

/**
 * Validate share code format
 * Must be exactly 6 characters, alphanumeric, uppercase
 */
export function isValidShareCode(code: string): boolean {
  if (!code || typeof code !== "string") return false;
  if (code.length !== 6) return false;

  // Only allow letters and numbers (uppercase)
  const validPattern = /^[A-Z0-9]{6}$/;
  return validPattern.test(code);
}

/**
 * Normalize share code (convert to uppercase, trim, remove hyphens)
 */
export function normalizeShareCode(code: string): string {
  return code.trim().toUpperCase().replace(/-/g, "");
}

/**
 * Format share code for display (add dash in middle)
 * Example: "BEARS7" -> "BEA-RS7"
 */
export function formatShareCode(code: string): string {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}
