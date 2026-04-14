'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { mockProducts } from '@/lib/mock-data/products'
import type { Alert, AlertType, AlertPriority } from '@/lib/types'
import { 
  AlertTriangle, 
  Package, 
  Clock,
  Bell,
  BellOff,
  Check,
  Filter,
  Trash2,
  RefreshCcw
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

const alertTypeConfig: Record<AlertType, { label: string; icon: React.ReactNode; color: string }> = {
  low_stock: { 
    label: 'Low Stock', 
    icon: <Package className="size-4" />, 
    color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' 
  },
  out_of_stock: { 
    label: 'Out of Stock', 
    icon: <AlertTriangle className="size-4" />, 
    color: 'bg-red-500/10 text-red-700 border-red-500/30' 
  },
  expiring: { 
    label: 'Expiring Soon', 
    icon: <Clock className="size-4" />, 
    color: 'bg-orange-500/10 text-orange-700 border-orange-500/30' 
  },
  system: { 
    label: 'System', 
    icon: <Bell className="size-4" />, 
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' 
  },
}

const priorityConfig: Record<AlertPriority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'bg-red-500 text-white' },
  high: { label: 'High', color: 'bg-orange-500 text-white' },
  medium: { label: 'Medium', color: 'bg-yellow-500 text-white' },
  low: { label: 'Low', color: 'bg-slate-500 text-white' },
}

// Generate mock alerts
function generateMockAlerts(): Alert[] {
  const alerts: Alert[] = [
    {
      id: 'alert_001',
      type: 'out_of_stock',
      priority: 'critical',
      title: 'Out of Stock: Eden Cheese',
      message: 'Eden Cheese 165g has run out of stock. Last sold 2 hours ago.',
      productId: 'prod_001',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: 'alert_002',
      type: 'low_stock',
      priority: 'high',
      title: 'Low Stock: Lucky Sardines',
      message: 'Only 5 units remaining. Reorder point is 20 units.',
      productId: 'prod_002',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: 'alert_003',
      type: 'low_stock',
      priority: 'high',
      title: 'Low Stock: Coca-Cola 1.5L',
      message: 'Only 8 units remaining. This is a fast-moving item.',
      productId: 'prod_003',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
    },
    {
      id: 'alert_004',
      type: 'expiring',
      priority: 'medium',
      title: 'Expiring: Bear Brand Milk',
      message: '15 units expiring in 5 days. Consider discount or promotion.',
      productId: 'prod_004',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: 'alert_005',
      type: 'low_stock',
      priority: 'medium',
      title: 'Low Stock: Piattos Cheese',
      message: '12 units remaining. Below reorder point of 25.',
      productId: 'prod_005',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      id: 'alert_006',
      type: 'system',
      priority: 'low',
      title: 'Daily Backup Complete',
      message: 'System backup completed successfully at 3:00 AM.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
    {
      id: 'alert_007',
      type: 'expiring',
      priority: 'high',
      title: 'Expiring: Fresh Eggs',
      message: '30 units expiring in 2 days. Urgent action required.',
      productId: 'prod_006',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: 'alert_008',
      type: 'low_stock',
      priority: 'low',
      title: 'Low Stock: Skyflakes Crackers',
      message: '18 units remaining. Close to reorder point.',
      productId: 'prod_007',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]
  
  return alerts.sort((a, b) => {
    // Sort by read status first, then by priority, then by date
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts())
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showRead, setShowRead] = useState(true)
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = typeFilter === 'all' || alert.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter
    const matchesRead = showRead || !alert.isRead
    return matchesType && matchesPriority && matchesRead
  })

  const unreadCount = alerts.filter(a => !a.isRead).length
  const criticalCount = alerts.filter(a => a.priority === 'critical' && !a.isRead).length

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ))
  }

  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, isRead: true })))
    toast.success('All alerts marked as read')
  }

  const handleDeleteSelected = () => {
    setAlerts(alerts.filter(a => !selectedAlerts.includes(a.id)))
    setSelectedAlerts([])
    setShowDeleteDialog(false)
    toast.success('Selected alerts deleted')
  }

  const handleToggleSelect = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([])
    } else {
      setSelectedAlerts(filteredAlerts.map(a => a.id))
    }
  }

  return (
    <DashboardShell
      title="Alerts Tracker"
      description="Monitor and manage system alerts"
      allowedRoles={['admin']}
    >
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Bell className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <AlertTriangle className="size-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10">
                <Package className="size-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.type === 'low_stock' || a.type === 'out_of_stock').length}
                </p>
                <p className="text-sm text-muted-foreground">Stock Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Alerts</CardTitle>
              <CardDescription>View and manage system notifications</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                <Check className="mr-2 size-4" />
                Mark All Read
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={selectedAlerts.length === 0}
              >
                <Trash2 className="mr-2 size-4" />
                Delete ({selectedAlerts.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="expiring">Expiring</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="show-read" 
                checked={showRead}
                onCheckedChange={(checked) => setShowRead(checked as boolean)}
              />
              <label htmlFor="show-read" className="text-sm">Show read alerts</label>
            </div>
          </div>

          {/* Select All */}
          {filteredAlerts.length > 0 && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <Checkbox 
                checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({filteredAlerts.length} alerts)
              </span>
            </div>
          )}

          {/* Alerts */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const typeConfig = alertTypeConfig[alert.type]
              const prioConfig = priorityConfig[alert.priority]
              
              return (
                <div 
                  key={alert.id} 
                  className={`rounded-lg border p-4 transition-colors ${
                    alert.isRead ? 'bg-muted/30' : 'bg-background'
                  } ${selectedAlerts.includes(alert.id) ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      checked={selectedAlerts.includes(alert.id)}
                      onCheckedChange={() => handleToggleSelect(alert.id)}
                    />
                    <div className={`flex size-10 items-center justify-center rounded-lg ${typeConfig.color}`}>
                      {typeConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-medium ${alert.isRead ? 'text-muted-foreground' : ''}`}>
                          {alert.title}
                        </h4>
                        <Badge className={prioConfig.color} variant="secondary">
                          {prioConfig.label}
                        </Badge>
                        {!alert.isRead && (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(alert.createdAt, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    {!alert.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <Check className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BellOff className="size-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No alerts found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Alerts</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedAlerts.length} selected alert{selectedAlerts.length > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
