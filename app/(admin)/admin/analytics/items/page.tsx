'use client'

import { useState, useMemo } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { DatePickerWithRange } from '@/components/shared/date-range-picker'
import { formatCurrency } from '@/lib/utils/currency'
import { useTransactions } from '@/contexts/transaction-context'
import type { Transaction } from '@/lib/types'
import type { DateRange } from 'react-day-picker'
import { subDays, format } from 'date-fns'
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  Package,
  BarChart3,
  Download,
  ArrowUpDown,
  Calendar
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ItemAnalytics {
  productId: string
  name: string
  category: string
  quantitySold: number
  revenue: number
  avgPrice: number
  trend: number // percentage change
}

// Generate comprehensive item analytics from filtered transactions
function generateItemAnalytics(transactions: Transaction[]): ItemAnalytics[] {
  const itemMap: Record<string, { 
    name: string; 
    quantity: number; 
    revenue: number; 
    transactions: number 
  }> = {}

  transactions.forEach(tx => {
    tx.items.forEach(item => {
      if (!itemMap[item.productId]) {
        itemMap[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          transactions: 0,
        }
      }
      itemMap[item.productId].quantity += item.quantity
      itemMap[item.productId].revenue += item.subtotal
      itemMap[item.productId].transactions++
    })
  })

  const categories = ['Canned Goods', 'Beverages', 'Snacks', 'Personal Care', 'Instant Noodles', 'Dairy']

  return Object.entries(itemMap)
    .map(([productId, data]) => ({
      productId,
      name: data.name,
      category: categories[Math.floor(Math.random() * categories.length)],
      quantitySold: data.quantity,
      revenue: data.revenue,
      avgPrice: data.revenue / data.quantity,
      trend: (Math.random() - 0.3) * 40, // -12% to +28%
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

const CHART_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
]

export default function ItemsAnalyticsPage() {
  const { transactions } = useTransactions()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity'>('revenue')
  const [period, setPeriod] = useState<'7' | '14' | '30' | 'custom'>('7')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Calculate date range based on period
  const effectiveDateRange = useMemo(() => {
    if (period === 'custom' && dateRange?.from && dateRange?.to) {
      return { from: dateRange.from, to: dateRange.to }
    }
    const days = parseInt(period)
    return { 
      from: subDays(new Date(), days - 1), 
      to: new Date() 
    }
  }, [period, dateRange])

  // Get filtered transactions based on date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.createdAt)
      return txDate >= effectiveDateRange.from && txDate <= effectiveDateRange.to
    })
  }, [effectiveDateRange, transactions])

  // Generate item analytics from filtered transactions
  const itemAnalytics = useMemo(() => {
    return generateItemAnalytics(filteredTransactions)
  }, [filteredTransactions])

  const topItems = itemAnalytics.slice(0, 10)

  const categories = [...new Set(itemAnalytics.map(item => item.category))]

  const filteredItems = itemAnalytics
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => sortBy === 'revenue' ? b.revenue - a.revenue : b.quantitySold - a.quantitySold)

  const totalRevenue = itemAnalytics.reduce((sum, item) => sum + item.revenue, 0)
  const totalQuantity = itemAnalytics.reduce((sum, item) => sum + item.quantitySold, 0)

  // Export to CSV function
  const handleExport = () => {
    const headers = ['Rank', 'Product', 'Category', 'Quantity Sold', 'Revenue (PHP)', 'Avg Price (PHP)', 'Share (%)', 'Trend (%)']
    const rows = filteredItems.map((item, index) => {
      const sharePercent = (item.revenue / totalRevenue) * 100
      return [
        index + 1,
        `"${item.name}"`,
        item.category,
        item.quantitySold,
        item.revenue.toFixed(2),
        item.avgPrice.toFixed(2),
        sharePercent.toFixed(2),
        item.trend.toFixed(2)
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    const dateStr = format(effectiveDateRange.from, 'yyyy-MM-dd') + '_to_' + format(effectiveDateRange.to, 'yyyy-MM-dd')
    link.setAttribute('download', `sales-by-item_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardShell
      title="Sales by Item"
      description="Analyze product performance and sales trends"
      allowedRoles={['admin']}
    >
      {/* Period Selector and Date Range Picker */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={period} onValueChange={(v) => setPeriod(v as '7' | '14' | '30' | 'custom')}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="14">Last 14 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        {period === 'custom' && (
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        )}
      </div>

      {/* Top Sellers Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Best Sellers</CardTitle>
          <CardDescription>Products ranked by total revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topItems} 
                layout="vertical"
                margin={{ left: 120, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  width={110}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {topItems.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products Sold</p>
                <p className="text-2xl font-bold">{itemAnalytics.length}</p>
              </div>
              <Package className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units Sold</p>
                <p className="text-2xl font-bold">{totalQuantity.toLocaleString()}</p>
              </div>
              <BarChart3 className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="size-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Item List */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Complete sales breakdown by item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex flex-1 flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'revenue' | 'quantity')}>
                <SelectTrigger className="w-[160px]">
                  <ArrowUpDown className="mr-2 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">By Revenue</SelectItem>
                  <SelectItem value="quantity">By Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Share</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.slice(0, 15).map((item, index) => {
                  const sharePercent = (item.revenue / totalRevenue) * 100
                  return (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {formatCurrency(item.avgPrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.quantitySold.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <Progress value={sharePercent} className="h-2" />
                          <span className="text-xs text-muted-foreground w-12">
                            {sharePercent.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${item.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.trend >= 0 ? (
                            <TrendingUp className="size-4" />
                          ) : (
                            <TrendingDown className="size-4" />
                          )}
                          <span className="text-sm font-medium">
                            {Math.abs(item.trend).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {Math.min(15, filteredItems.length)} of {filteredItems.length} products
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
