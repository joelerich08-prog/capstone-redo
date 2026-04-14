"use client"

import { StockmanShell } from "@/components/layout/stockman-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/shared/stat-card"
import { mockProducts } from "@/lib/mock-data/products"
import { useInventory } from "@/contexts/inventory-context"
import { Package, AlertTriangle, ArrowRightLeft, Scissors, ChevronRight, Boxes, Clock, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

const activityColors: Record<string, string> = {
  receiving: "bg-green-500",
  breakdown: "bg-orange-500",
  transfer: "bg-blue-500",
  adjustment: "bg-gray-500",
}

export default function StockmanDashboardPage() {
  const { inventoryLevels, activityLog } = useInventory()

  // Calculate low stock items based on actual inventory
  const lowStockItems = mockProducts.filter(p => {
    const inventory = inventoryLevels.find(inv => inv.productId === p.id)
    const storeStock = inventory?.shelfQty || 0
    const reorderLevel = inventory?.reorderLevel || 20
    return storeStock < reorderLevel
  }).slice(0, 5)

  const criticalItems = lowStockItems.filter(p => {
    const inventory = inventoryLevels.find(inv => inv.productId === p.id)
    const storeStock = inventory?.shelfQty || 0
    return storeStock < 5
  }).length

  // Calculate totals from actual inventory
  const totalWholesale = inventoryLevels.reduce((acc, inv) => acc + inv.wholesaleQty, 0)
  const totalRetail = inventoryLevels.reduce((acc, inv) => acc + inv.retailQty, 0)
  const totalShelf = inventoryLevels.reduce((acc, inv) => acc + inv.shelfQty, 0)

  // Get recent activity (last 3)
  const recentActivity = activityLog.slice(0, 3)

  // Calculate today's stats from activity log
  const today = new Date()
  const todayActivities = activityLog.filter(a => 
    a.timestamp.toDateString() === today.toDateString()
  )
  const todayReceiving = todayActivities.filter(a => a.type === "receiving").length
  const todayTransfers = todayActivities.filter(a => a.type === "transfer").length

  // Calculate pending tasks based on low stock items that need action
  const itemsNeedingTransfer = inventoryLevels.filter(inv => 
    inv.shelfQty <= inv.reorderLevel && inv.retailQty > 0
  ).length
  const itemsNeedingBreakdown = inventoryLevels.filter(inv => 
    inv.retailQty < 10 && inv.wholesaleQty > 0
  ).length

  return (
    <StockmanShell title="Stockman Dashboard" description="Manage inventory and stock operations">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={mockProducts.length.toString()}
            icon={Package}
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockItems.length.toString()}
            description={lowStockItems.length > 0 ? "items need attention" : "All stock levels OK"}
            icon={AlertTriangle}
            trend={criticalItems > 0 ? { value: `${criticalItems} critical`, positive: false } : undefined}
          />
          <StatCard
            title="Total Wholesale"
            value={totalWholesale.toString()}
            description="units"
            icon={Boxes}
          />
          <StatCard
            title="Total Shelf Stock"
            value={totalShelf.toString()}
            description="units"
            icon={ArrowRightLeft}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common inventory operations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-between h-auto py-4">
                <Link href="/stockman/breakdown">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Scissors className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Break Down Stock</p>
                      <p className="text-sm text-muted-foreground">Wholesale to retail</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between h-auto py-4">
                <Link href="/stockman/transfer">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Transfer Stock</p>
                      <p className="text-sm text-muted-foreground">Between tiers</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between h-auto py-4">
                <Link href="/stockman/receiving">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Boxes className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Receive Stock</p>
                      <p className="text-sm text-muted-foreground">Record incoming</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-between h-auto py-4">
                <Link href="/stockman/stock-levels">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                      <Package className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Stock Levels</p>
                      <p className="text-sm text-muted-foreground">View all tiers</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Items needing attention</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/stockman/stock-levels">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.map((product) => {
                  const inventory = inventoryLevels.find(inv => inv.productId === product.id)
                  const storeStock = inventory?.shelfQty || 0
                  const reorderLevel = inventory?.reorderLevel || 20
                  const maxStock = reorderLevel * 2
                  const percentage = (storeStock / maxStock) * 100
                  const isCritical = storeStock < 5
                  return (
                    <div key={product.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate max-w-[150px]">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{storeStock} pcs</span>
                          {isCritical ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isCritical ? "[&>div]:bg-red-500" : "[&>div]:bg-yellow-500"}`}
                      />
                    </div>
                  )
                })}
                {lowStockItems.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">All stock levels are healthy</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest operations</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/stockman/activity">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="relative">
                        <div className={`h-2 w-2 rounded-full ${activityColors[activity.type] || 'bg-gray-500'}`} />
                        {index < recentActivity.length - 1 && (
                          <div className="absolute left-1/2 top-3 h-full w-px -translate-x-1/2 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm">{activity.description}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(activity.timestamp, "h:mm a")}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Items Need Transfer</span>
                  </div>
                  <Badge>{itemsNeedingTransfer}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Scissors className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Items Need Breakdown</span>
                  </div>
                  <Badge>{itemsNeedingBreakdown}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Stock Distribution</CardTitle>
              <CardDescription>Current inventory across tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                    <Package className="h-6 w-6 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold">{totalWholesale.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Wholesale</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{totalRetail.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Retail</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <Package className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{totalShelf.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Store Shelf</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StockmanShell>
  )
}
