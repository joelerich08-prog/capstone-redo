"use client"

import type { DateRange } from "react-day-picker"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ProfitReportProps {
  dateRange: DateRange | undefined
}

const profitData = [
  { period: "Week 1", revenue: 145000, cost: 98000, profit: 47000 },
  { period: "Week 2", revenue: 168000, cost: 112000, profit: 56000 },
  { period: "Week 3", revenue: 155000, cost: 105000, profit: 50000 },
  { period: "Week 4", revenue: 192000, cost: 125000, profit: 67000 },
]

const marginByCategory = [
  { category: "Beverages", revenue: 125000, cost: 82500, margin: 34 },
  { category: "Canned Goods", revenue: 98000, cost: 68600, margin: 30 },
  { category: "Snacks", revenue: 85000, cost: 51000, margin: 40 },
  { category: "Dairy", revenue: 72000, cost: 50400, margin: 30 },
  { category: "Noodles", revenue: 110000, cost: 77000, margin: 30 },
  { category: "Personal Care", revenue: 45000, cost: 29250, margin: 35 },
]

const expenseBreakdown = [
  { category: "Cost of Goods Sold", amount: 440000, percentage: 65.7 },
  { category: "Labor", amount: 85000, percentage: 12.7 },
  { category: "Utilities", amount: 25000, percentage: 3.7 },
  { category: "Rent", amount: 45000, percentage: 6.7 },
  { category: "Other Expenses", amount: 15000, percentage: 2.2 },
]

const dailyProfitTrend = [
  { date: "Mar 12", profit: 4200 },
  { date: "Mar 13", profit: 5800 },
  { date: "Mar 14", profit: 5100 },
  { date: "Mar 15", profit: 7200 },
  { date: "Mar 16", profit: 9500 },
  { date: "Mar 17", profit: 10800 },
  { date: "Mar 18", profit: 7800 },
  { date: "Mar 19", profit: 6200 },
  { date: "Mar 20", profit: 6900 },
  { date: "Mar 21", profit: 8600 },
]

export function ProfitReport({ dateRange }: ProfitReportProps) {
  const totalRevenue = profitData.reduce((acc, week) => acc + week.revenue, 0)
  const totalCost = profitData.reduce((acc, week) => acc + week.cost, 0)
  const totalProfit = profitData.reduce((acc, week) => acc + week.profit, 0)
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)
  const totalExpenses = expenseBreakdown.reduce((acc, exp) => acc + exp.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          <div className="mt-1 flex items-center text-sm text-green-500">
            <TrendingUp className="mr-1 h-4 w-4" />
            +12.5% vs last period
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          <div className="mt-1 flex items-center text-sm text-muted-foreground">
            <Minus className="mr-1 h-4 w-4" />
            +8.2% vs last period
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Gross Profit</p>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(totalProfit)}</p>
          <div className="mt-1 flex items-center text-sm text-green-500">
            <TrendingUp className="mr-1 h-4 w-4" />
            +18.3% vs last period
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Profit Margin</p>
          <p className="text-2xl font-bold">{profitMargin}%</p>
          <div className="mt-1 flex items-center text-sm text-green-500">
            <TrendingUp className="mr-1 h-4 w-4" />
            +2.1% vs last period
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Revenue vs Cost vs Profit</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="period" className="text-xs" />
              <YAxis 
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ fill: "hsl(var(--chart-2))" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Daily Profit Trend</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyProfitTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis 
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Profit"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Profit Margin by Category</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marginByCategory.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(item.cost)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${item.margin >= 35 ? "text-green-500" : ""}`}>
                      {item.margin}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Expense Breakdown</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseBreakdown.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {item.percentage}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">Total Expenses</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalExpenses)}</TableCell>
                <TableCell className="text-right font-bold">91.0%</TableCell>
              </TableRow>
              <TableRow className="bg-green-500/10">
                <TableCell className="font-bold text-green-500">Net Profit</TableCell>
                <TableCell className="text-right font-bold text-green-500">{formatCurrency(netProfit)}</TableCell>
                <TableCell className="text-right font-bold text-green-500">9.0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
