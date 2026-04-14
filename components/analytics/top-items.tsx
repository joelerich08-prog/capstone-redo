'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTransactions } from '@/contexts/transaction-context'
import { formatPeso } from '@/lib/utils/currency'
import { Progress } from '@/components/ui/progress'

interface TopItemsProps {
  limit?: number
}

export function TopItems({ limit = 5 }: TopItemsProps) {
  const { transactions } = useTransactions()
  
  const items = useMemo(() => {
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>()
    
    transactions.forEach(tx => {
      tx.items.forEach(item => {
        const key = item.productName
        const existing = itemMap.get(key)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.subtotal
        } else {
          itemMap.set(key, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.subtotal,
          })
        }
      })
    })
    
    return Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  }, [transactions, limit])
  
  const maxRevenue = items.length > 0 ? items[0].revenue : 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Items</CardTitle>
        <CardDescription>Best performing products by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium truncate max-w-[150px]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium tabular-nums">{formatPeso(item.revenue)}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    ({item.quantity} sold)
                  </span>
                </div>
              </div>
              <Progress 
                value={(item.revenue / maxRevenue) * 100} 
                className="h-1.5"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
