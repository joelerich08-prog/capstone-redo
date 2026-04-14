import { formatPeso, formatPesoCompact } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'

interface CurrencyProps {
  amount: number
  compact?: boolean
  className?: string
  showSign?: boolean
}

export function Currency({
  amount,
  compact = false,
  className,
  showSign = false,
}: CurrencyProps) {
  const formatted = compact ? formatPesoCompact(amount) : formatPeso(amount)
  const displayValue = showSign && amount > 0 ? `+${formatted}` : formatted

  return (
    <span className={cn('tabular-nums', className)}>
      {displayValue}
    </span>
  )
}

interface CurrencyChangeProps {
  current: number
  previous: number
  className?: string
}

export function CurrencyChange({ current, previous, className }: CurrencyChangeProps) {
  const change = current - previous
  const percentChange = previous !== 0 ? ((change / previous) * 100).toFixed(1) : 0
  const isPositive = change >= 0

  return (
    <span
      className={cn(
        'text-sm font-medium',
        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        className
      )}
    >
      {isPositive ? '+' : ''}
      {percentChange}%
    </span>
  )
}
