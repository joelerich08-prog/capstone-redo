'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/contexts/order-context'
import { formatPeso } from '@/lib/utils/currency'
import { formatDistanceToNow } from 'date-fns'
import { ChevronRight, Facebook, MessageSquare, Globe } from 'lucide-react'
import Link from 'next/link'

export function PendingOrders() {
  const { orders: allOrders } = useOrders()
  const orders = allOrders.slice(0, 5)

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'facebook':
        return Facebook
      case 'sms':
        return MessageSquare
      case 'website':
        return Globe
      default:
        return Globe
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pending</Badge>
      case 'preparing':
        return <Badge className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Preparing</Badge>
      case 'ready':
        return <Badge className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Ready</Badge>
      case 'completed':
        return <Badge variant="secondary" className="text-xs">Completed</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Online Orders</CardTitle>
        <CardDescription>Recent orders from all channels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => {
            const SourceIcon = getSourceIcon(order.source)
            return (
              <div
                key={order.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <SourceIcon className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{order.orderNo}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.customerName} - {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">{formatPeso(order.total)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
          <Link href="/admin/orders">
            View all orders
            <ChevronRight className="size-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
