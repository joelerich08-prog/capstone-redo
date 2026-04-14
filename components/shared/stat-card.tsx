import { type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon?: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground break-words flex-1 pr-2">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-2xl font-bold tabular-nums break-words">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  'font-medium mr-1',
                  trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.value}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
