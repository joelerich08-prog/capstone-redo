'use client'

import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StatCard } from '@/components/shared/stat-card'
import { SalesChart } from '@/components/analytics/sales-chart'
import { TopItems } from '@/components/analytics/top-items'
import { InventoryStatus } from '@/components/analytics/inventory-status'
import { RecentTransactions } from '@/components/analytics/recent-transactions'
import { AlertsPanel } from '@/components/analytics/alerts-panel'
import { ExpiryAlertsPanel } from '@/components/analytics/expiry-alerts-panel'
import { PendingOrders } from '@/components/analytics/pending-orders'
import { Button } from '@/components/ui/button'
import { useTransactions } from '@/contexts/transaction-context'
import { getLowStockProducts, getOutOfStockProducts } from '@/lib/mock-data/products'
import { useOrders } from '@/contexts/order-context'
import { useBatches } from '@/contexts/batch-context'
import { formatPeso } from '@/lib/utils/currency'
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  ClipboardList,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const { getTodayTransactions, getYesterdayTransactions, getYesterdayStats, transactions } = useTransactions()
  const { getPendingOrdersCount } = useOrders()
  const { getBatchSummary, getCriticalBatches } = useBatches()
  const todayTx = getTodayTransactions()
  const batchSummary = getBatchSummary()
  const criticalBatches = getCriticalBatches()
  const lowStock = getLowStockProducts()
  const outOfStock = getOutOfStockProducts()
  const pendingOrders = getPendingOrdersCount()

  // Calculate today's stats from transactions
  const stats = {
    todaySales: todayTx.reduce((sum, t) => sum + t.total, 0),
    totalTransactions: transactions.length,
  }

  // Calculate yesterday's stats for real comparison
  const yesterdayStats = getYesterdayStats()
  const yesterdayTx = getYesterdayTransactions()
  const yesterdayComparison = {
    sales: yesterdayStats.sales || 1, // Avoid division by zero
    transactions: yesterdayTx.length,
  }

  return (
    <DashboardShell
      title="Dashboard"
      description="Overview of your store performance"
      allowedRoles={['admin']}
    >
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button asChild>
          <Link href="/admin/pos">
            <Plus className="size-4 mr-2" />
            New Sale
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/inventory/receive">
            <Package className="size-4 mr-2" />
            Receive Stock
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/orders">
            <ClipboardList className="size-4 mr-2" />
            View Orders
            {pendingOrders > 0 && (
              <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                {pendingOrders}
              </span>
            )}
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <StatCard
          title="Today's Sales"
          value={formatPeso(stats.todaySales)}
          icon={TrendingUp}
          trend={yesterdayComparison.sales > 0 ? {
            value: `${stats.todaySales >= yesterdayComparison.sales ? '+' : ''}${((stats.todaySales / yesterdayComparison.sales - 1) * 100).toFixed(1)}%`,
            positive: stats.todaySales >= yesterdayComparison.sales,
          } : undefined}
          description={yesterdayComparison.sales > 0 ? "vs yesterday" : "No data yesterday"}
        />
        <StatCard
          title="Transactions"
          value={todayTx.length.toString()}
          icon={ShoppingCart}
          trend={yesterdayComparison.transactions > 0 ? {
            value: `${todayTx.length >= yesterdayComparison.transactions ? '+' : ''}${todayTx.length - yesterdayComparison.transactions}`,
            positive: todayTx.length >= yesterdayComparison.transactions,
          } : undefined}
          description={yesterdayComparison.transactions > 0 ? "vs yesterday" : "No data yesterday"}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStock.length.toString()}
          icon={Package}
          description={`${outOfStock.length} out of stock`}
          className={lowStock.length > 0 ? 'border-orange-500/30' : ''}
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders.toString()}
          icon={AlertTriangle}
          description="Awaiting fulfillment"
          className={pendingOrders > 0 ? 'border-primary/30' : ''}
        />
        <StatCard
          title="Expiring Soon"
          value={batchSummary.expiringSoon.toString()}
          icon={Clock}
          description={`${criticalBatches.length} critical`}
          className={criticalBatches.length > 0 ? 'border-destructive/30' : batchSummary.expiringSoon > 0 ? 'border-orange-500/30' : ''}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
        <SalesChart />
        <TopItems />
      </div>

      {/* Inventory, Expiry, and Alerts Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 mb-6">
        <InventoryStatus />
        <ExpiryAlertsPanel />
        <AlertsPanel />
      </div>

      {/* Transactions and Orders Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <RecentTransactions />
        <PendingOrders />
      </div>
    </DashboardShell>
  )
}
