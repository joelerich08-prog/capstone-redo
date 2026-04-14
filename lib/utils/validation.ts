/**
 * Shared validation utilities
 * Standardizes validation logic across the application
 */

// Philippine phone number regex - supports:
// - 09XXXXXXXXX (11 digits)
// - +639XXXXXXXXX (12 digits with country code)
// - 639XXXXXXXXX (12 digits without plus)
export const PHONE_REGEX = /^(\+63|63|0)?9\d{9}$/

/**
 * Validates a Philippine phone number
 * Accepts formats: 09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-()]/g, '')
  return PHONE_REGEX.test(cleanPhone)
}

/**
 * Normalizes a phone number to +639XXXXXXXXX format
 */
export function normalizePhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-()]/g, '')
  
  if (cleanPhone.startsWith('+63')) {
    return cleanPhone
  }
  if (cleanPhone.startsWith('63')) {
    return '+' + cleanPhone
  }
  if (cleanPhone.startsWith('0')) {
    return '+63' + cleanPhone.slice(1)
  }
  if (cleanPhone.startsWith('9')) {
    return '+63' + cleanPhone
  }
  
  return cleanPhone
}

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Validates a password meets minimum requirements
 */
export function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' }
  }
  return { valid: true }
}

/**
 * Validates a name field
 */
export function isValidName(name: string): { valid: boolean; error?: string } {
  const trimmedName = name?.trim()
  if (!trimmedName || trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' }
  }
  return { valid: true }
}
