'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useBatches } from '@/contexts/batch-context'
import { mockProducts } from '@/lib/mock-data/products'
import { formatCurrency } from '@/lib/utils/currency'
import { EXPIRY_CRITICAL_DAYS, EXPIRY_WARNING_DAYS } from '@/lib/mock-data/batches'
import { differenceInDays, format } from 'date-fns'
import { Clock, AlertTriangle, ChevronRight, Calendar } from 'lucide-react'
import Link from 'next/link'

export function ExpiryAlertsPanel() {
  const { getExpiringBatches, getCriticalBatches, getBatchSummary } = useBatches()

  const criticalBatches = getCriticalBatches()
  const expiringBatches = getExpiringBatches()
  const summary = getBatchSummary()

  const totalAlerts = criticalBatches.length + expiringBatches.length

  // Display critical batches first, then expiring soon
  const displayBatches = [...criticalBatches, ...expiringBatches.filter(
    b => !criticalBatches.some(c => c.id === b.id)
  )].slice(0, 4)

  const getExpiryBadge = (expirationDate: Date) => {
    const days = differenceInDays(expirationDate, new Date())
    
    if (days <= EXPIRY_CRITICAL_DAYS) {
      return (
        <Badge variant="destructive" className="text-xs animate-pulse">
          {days}d left
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-700 border-orange-500/30">
        {days}d left
      </Badge>
    )
  }

  if (totalAlerts === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Expiry Tracker</CardTitle>
              <CardDescription className="text-xs">
                Product batch expiration status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10 mb-3">
              <Clock className="size-6 text-green-600" />
            </div>
            <p className="font-medium text-green-600">All Clear</p>
            <p className="text-sm text-muted-foreground mt-1">
              No products expiring within {EXPIRY_WARNING_DAYS} days
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={criticalBatches.length > 0 ? 'border-destructive/30' : 'border-orange-500/30'}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 space-y-2 sm:space-y-0">
        <div className="flex items-start gap-2">
          {criticalBatches.length > 0 ? (
            <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
          ) : (
            <Clock className="size-4 text-orange-500 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <CardTitle className="text-base">Expiry Tracker</CardTitle>
            <CardDescription className="text-xs">
              Products approaching expiration
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {criticalBatches.length > 0 && (
            <Badge variant="destructive" className="text-xs shrink-0">
              {criticalBatches.length} critical
            </Badge>
          )}
          {expiringBatches.length > criticalBatches.length && (
            <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-700 shrink-0">
              {expiringBatches.length - criticalBatches.length} soon
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Value at Risk Summary */}
        {summary.valueAtRisk > 0 && (
          <div className="mb-4 rounded-lg border border-dashed p-3 bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Value at risk</span>
              <span className="font-bold text-destructive">
                {formatCurrency(summary.valueAtRisk)}
              </span>
            </div>
            <Progress 
              value={Math.min((summary.expiringSoon / Math.max(summary.total, 1)) * 100, 100)} 
              className="h-1.5 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {summary.expiringSoon} of {summary.total} batches expiring
            </p>
          </div>
        )}

        {/* Expiring Batches List */}
        <div className="space-y-3">
          {displayBatches.map((batch) => {
            const product = mockProducts.find(p => p.id === batch.productId)
            const days = differenceInDays(batch.expirationDate, new Date())
            const isCritical = days <= EXPIRY_CRITICAL_DAYS
            const totalQty = batch.wholesaleQty + batch.retailQty + batch.shelfQty

            return (
              <div
                key={batch.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  isCritical 
                    ? 'bg-destructive/5 border-destructive/20' 
                    : 'bg-orange-500/5 border-orange-500/20'
                }`}
              >
                <div className={`flex size-8 items-center justify-center rounded-full ${
                  isCritical ? 'bg-destructive/10' : 'bg-orange-500/10'
                }`}>
                  <Calendar className={`size-4 ${isCritical ? 'text-destructive' : 'text-orange-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <p className="text-sm font-medium break-words">
                      {product?.name || 'Unknown Product'}
                    </p>
                    <div className="shrink-0">
                      {getExpiryBadge(batch.expirationDate)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded truncate">
                        {batch.batchNumber}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {totalQty} units
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expires {format(batch.expirationDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
          <Link href="/admin/inventory/expiry">
            View all batches
            <ChevronRight className="size-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
