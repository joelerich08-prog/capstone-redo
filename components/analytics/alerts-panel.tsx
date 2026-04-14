'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCriticalAlerts } from '@/lib/mock-data/alerts'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Package, Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function AlertsPanel() {
  const alerts = getCriticalAlerts()

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return Package
      default:
        return Bell
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 space-y-2 sm:space-y-0">
        <div className="flex items-start gap-2">
          <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
          <div className="min-w-0">
            <CardTitle className="text-base">Active Alerts</CardTitle>
            <CardDescription className="text-xs">
              Items requiring attention
            </CardDescription>
          </div>
        </div>
        <Badge variant="destructive" className="text-xs shrink-0 h-fit">
          {alerts.length} active
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 4).map((alert) => {
            const Icon = getAlertIcon(alert.type)
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${getPriorityColor(alert.priority)}`}
              >
                <Icon className="size-4 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs opacity-80">{alert.message}</p>
                  <p className="text-xs opacity-60">
                    {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
          <Link href="/admin/analytics/alerts">
            View all alerts
            <ChevronRight className="size-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
