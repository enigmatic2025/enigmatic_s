export interface PasswordValidationResult {
  valid: boolean
  error: string | null
}

/**
 * Validates a password against the security policy.
 * Must match Supabase Dashboard settings AND Go backend validation.
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(password)) {
    return { valid: false, error: "Password must contain at least one special character" }
  }
  return { valid: true, error: null }
}

export const PASSWORD_REQUIREMENTS = [
  "At least 8 characters",
  "One uppercase letter",
  "One lowercase letter",
  "One number",
  "One special character (!@#$%^&*...)",
] as const
