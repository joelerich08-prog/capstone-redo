'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTransactions } from '@/contexts/transaction-context'
import { formatPeso } from '@/lib/utils/currency'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface SalesChartProps {
  days?: number
  title?: string
  description?: string
}

export function SalesChart({
  days = 7,
  title = 'Sales Trend',
  description = 'Daily sales over the past week',
}: SalesChartProps) {
  const { transactions } = useTransactions()
  
  const data = useMemo(() => {
    const result: { date: string; sales: number; transactions: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      const dayTxns = transactions.filter(t => {
        const txnDate = new Date(t.createdAt)
        return txnDate >= dayStart && txnDate <= dayEnd
      })
      result.push({
        date: format(date, 'MMM d'),
        sales: dayTxns.reduce((sum, t) => sum + t.total, 0),
        transactions: dayTxns.length,
      })
    }
    return result
  }, [transactions, days])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="text-sm font-medium">{data.date}</p>
                      <p className="text-sm text-muted-foreground">
                        Sales: <span className="font-medium text-foreground">{formatPeso(data.sales)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Transactions: <span className="font-medium text-foreground">{data.transactions}</span>
                      </p>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
