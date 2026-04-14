"use client"

import type { DateRange } from "react-day-picker"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils/currency"
import { Badge } from "@/components/ui/badge"

interface SalesReportProps {
  dateRange: DateRange | undefined
}

const dailySalesData = [
  { date: "Mar 12", sales: 12500, transactions: 45 },
  { date: "Mar 13", sales: 18200, transactions: 62 },
  { date: "Mar 14", sales: 15800, transactions: 55 },
  { date: "Mar 15", sales: 22400, transactions: 78 },
  { date: "Mar 16", sales: 28900, transactions: 95 },
  { date: "Mar 17", sales: 32500, transactions: 112 },
  { date: "Mar 18", sales: 24100, transactions: 82 },
  { date: "Mar 19", sales: 19800, transactions: 68 },
  { date: "Mar 20", sales: 21500, transactions: 74 },
  { date: "Mar 21", sales: 26800, transactions: 89 },
]

const paymentMethodData = [
  { method: "Cash", amount: 125000, count: 320 },
  { method: "GCash", amount: 85000, count: 245 },
  { method: "Maya", amount: 42000, count: 95 },
]

const topSellingItems = [
  { name: "Lucky Me Pancit Canton", category: "Noodles", quantity: 450, revenue: 13500 },
  { name: "Argentina Corned Beef", category: "Canned Goods", quantity: 280, revenue: 16800 },
  { name: "Kopiko 78C", category: "Beverages", quantity: 520, revenue: 15600 },
  { name: "Eden Cheese", category: "Dairy", quantity: 180, revenue: 16200 },
  { name: "Oishi Prawn Crackers", category: "Snacks", quantity: 350, revenue: 8750 },
]

export function SalesReport({ dateRange }: SalesReportProps) {
  const totalSales = dailySalesData.reduce((acc, day) => acc + day.sales, 0)
  const totalTransactions = dailySalesData.reduce((acc, day) => acc + day.transactions, 0)
  const avgTransactionValue = totalSales / totalTransactions

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-bold">{totalTransactions}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg. Transaction Value</p>
          <p className="text-2xl font-bold">{formatCurrency(avgTransactionValue)}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Daily Sales Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis 
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Sales"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Sales by Payment Method</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentMethodData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="method" width={80} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Amount"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Top Selling Items</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty Sold</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSellingItems.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
