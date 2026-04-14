"use client"

import { useState, useEffect, useMemo } from "react"
import { CashierShell } from "@/components/layout/cashier-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { StatCard } from "@/components/shared/stat-card"
import { formatCurrency } from "@/lib/utils/currency"
import { Calculator, Receipt, TrendingUp, ChevronRight, CreditCard, Banknote, Smartphone, ClipboardList } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useTransactions } from "@/contexts/transaction-context"
import { useOrders } from "@/contexts/order-context"

export default function CashierDashboardPage() {
  const { user } = useAuth()
  const { getTodayTransactions, transactions } = useTransactions()
  const { orders } = useOrders()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate from real data only on client to avoid hydration mismatch
  const todayData = useMemo(() => {
    if (!isClient) return { sales: 0, count: 0, avg: 0, cash: 0, gcash: 0, maya: 0 }
    const txns = getTodayTransactions()
    const sales = txns.reduce((sum, t) => sum + t.total, 0)
    const count = txns.length
    const avg = count > 0 ? sales / count : 0
    const cash = txns.filter(t => t.paymentType === 'cash').reduce((sum, t) => sum + t.total, 0)
    const gcash = txns.filter(t => t.paymentType === 'gcash').reduce((sum, t) => sum + t.total, 0)
    const maya = txns.filter(t => t.paymentType === 'maya').reduce((sum, t) => sum + t.total, 0)
    return { sales, count, avg, cash, gcash, maya }
  }, [isClient, getTodayTransactions])

  const pendingOrders = useMemo(() => {
    if (!isClient) return 0
    return orders.filter(o => o.status === 'pending' || o.status === 'preparing').length
  }, [isClient, orders])

  const paymentSummary = [
    { method: "Cash", icon: Banknote, amount: todayData.cash, color: "text-green-500 bg-green-500/10" },
    { method: "GCash", icon: Smartphone, amount: todayData.gcash, color: "text-blue-500 bg-blue-500/10" },
    { method: "Maya", icon: CreditCard, amount: todayData.maya, color: "text-emerald-500 bg-emerald-500/10" },
  ]

  // Get recent transactions from context
  const recentTransactions = useMemo(() => {
    if (!isClient) return []
    return transactions.slice(0, 5).map(txn => {
      const now = new Date()
      const txnDate = new Date(txn.createdAt)
      const diffMs = now.getTime() - txnDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      
      let timeAgo = ''
      if (diffMins < 1) timeAgo = 'Just now'
      else if (diffMins < 60) timeAgo = `${diffMins} min ago`
      else if (diffHours < 24) timeAgo = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`
      else timeAgo = txnDate.toLocaleDateString()
      
      return {
        id: txn.invoiceNo || txn.id,
        amount: txn.total,
        items: txn.items.length,
        time: timeAgo,
        status: txn.status,
      }
    })
  }, [isClient, transactions])

  return (
    <CashierShell title="Cashier Dashboard" description={`Welcome back, ${user?.name?.split(" ")[0] || "Cashier"}! Here is your daily overview.`}>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Today's Sales"
          value={isClient ? formatCurrency(todayData.sales) : "Loading..."}
          icon={TrendingUp}
        />
        <StatCard
          title="Transactions"
          value={isClient ? todayData.count.toString() : "..."}
          icon={Receipt}
        />
        <StatCard
          title="Avg. Transaction"
          value={isClient ? formatCurrency(todayData.avg) : "..."}
          icon={Calculator}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start processing transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between h-auto py-4" size="lg">
              <Link href="/cashier/pos">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Open POS</p>
                    <p className="text-sm opacity-80">New transaction</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-auto py-4">
              <Link href="/cashier/transactions">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Transactions</p>
                    <p className="text-sm text-muted-foreground">View sales</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>

            {pendingOrders > 0 && (
              <Button asChild variant="outline" className="w-full justify-between h-auto py-4 border-orange-500/50">
                <Link href="/cashier/orders">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <ClipboardList className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Pending Orders</p>
                      <p className="text-sm text-orange-500">{pendingOrders} orders waiting</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{pendingOrders}</Badge>
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Breakdown by payment type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentSummary.map((payment) => (
              <div key={payment.method} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${payment.color}`}>
                    <payment.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{payment.method}</span>
                </div>
                <span className="text-lg font-semibold">{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your last 5 sales</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/cashier/transactions">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{txn.id}</p>
                      {txn.status === "refunded" && (
                        <Badge variant="secondary" className="text-xs">Refunded</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{txn.items} items | {txn.time}</p>
                  </div>
                  <span className={`font-semibold ${txn.status === "refunded" ? "text-muted-foreground line-through" : ""}`}>
                    {formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CashierShell>
  )
}
