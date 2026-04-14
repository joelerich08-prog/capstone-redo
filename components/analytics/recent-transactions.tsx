'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTransactions } from '@/contexts/transaction-context'
import { formatPeso } from '@/lib/utils/currency'
import { formatDistanceToNow } from 'date-fns'

interface RecentTransactionsProps {
  limit?: number
}

export function RecentTransactions({ limit = 5 }: RecentTransactionsProps) {
  const { transactions: allTransactions } = useTransactions()
  const transactions = allTransactions.slice(0, limit)

  const getPaymentBadgeVariant = (type: string) => {
    switch (type) {
      case 'cash':
        return 'secondary'
      case 'gcash':
        return 'default'
      case 'maya':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest sales transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{tx.invoiceNo}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getPaymentBadgeVariant(tx.paymentType)} className="text-xs capitalize">
                    {tx.paymentType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {tx.items.length} item{tx.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium tabular-nums">{formatPeso(tx.total)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(tx.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
