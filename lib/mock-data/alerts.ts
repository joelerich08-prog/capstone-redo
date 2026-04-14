import type { Alert } from '@/lib/types'

export const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    type: 'out_of_stock',
    priority: 'critical',
    title: 'Out of Stock',
    message: 'Colgate Toothpaste is out of stock on shelf',
    productId: 'prod_011',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: 'alert_002',
    type: 'low_stock',
    priority: 'high',
    title: 'Low Stock Warning',
    message: 'Piattos (Cheese) is running low - only 8 units left',
    productId: 'prod_006',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'alert_003',
    type: 'low_stock',
    priority: 'high',
    title: 'Low Stock Warning',
    message: 'Safeguard Soap (Pure White) is running low - only 5 units left',
    productId: 'prod_009',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 'alert_004',
    type: 'low_stock',
    priority: 'medium',
    title: 'Low Stock Warning',
    message: 'Eden Cheese is running low - only 3 units left',
    productId: 'prod_020',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 'alert_005',
    type: 'system',
    priority: 'low',
    title: 'Daily Backup Complete',
    message: 'System backup completed successfully',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
]

export function getUnreadAlerts(): Alert[] {
  return mockAlerts.filter(alert => !alert.isRead)
}

export function getUnreadAlertsCount(): number {
  return getUnreadAlerts().length
}

export function getCriticalAlerts(): Alert[] {
  return mockAlerts.filter(alert => alert.priority === 'critical' || alert.priority === 'high')
}

export function getRecentAlerts(limit: number = 5): Alert[] {
  return [...mockAlerts]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}
