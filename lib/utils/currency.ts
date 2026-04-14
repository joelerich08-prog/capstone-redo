// Philippine Peso currency formatting utilities

/**
 * Format a number as Philippine Peso currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to include the peso sign (default: true)
 * @returns Formatted currency string
 */
export function formatPeso(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  
  return showSymbol ? `₱${formatted}` : formatted
}

/**
 * Format a number as compact Philippine Peso (e.g., ₱1.2K, ₱5.5M)
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export function formatPesoCompact(amount: number): string {
  if (amount >= 1000000) {
    return `₱${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `₱${(amount / 1000).toFixed(1)}K`
  }
  return formatPeso(amount)
}

/**
 * Parse a peso string back to a number
 * @param value - The string to parse
 * @returns Parsed number or 0 if invalid
 */
export function parsePeso(value: string): number {
  const cleaned = value.replace(/[₱,\s]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format number with thousand separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PH').format(num)
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change with sign
 */
export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return '+0%'
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

/**
 * Alias for formatPeso for compatibility
 */
export const formatCurrency = formatPeso
