"use client"

import type { DateRange } from "react-day-picker"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { Progress } from "@/components/ui/progress"

interface InventoryReportProps {
  dateRange: DateRange | undefined
}

const stockStatusData = [
  { name: "In Stock", value: 245, color: "hsl(var(--chart-2))" },
  { name: "Low Stock", value: 42, color: "hsl(var(--chart-4))" },
  { name: "Out of Stock", value: 8, color: "hsl(var(--destructive))" },
]

const categoryStockData = [
  { category: "Beverages", wholesale: 150, retail: 420, store: 85 },
  { category: "Canned Goods", wholesale: 80, retail: 320, store: 65 },
  { category: "Snacks", wholesale: 120, retail: 580, store: 95 },
  { category: "Dairy", wholesale: 45, retail: 180, store: 40 },
  { category: "Noodles", wholesale: 200, retail: 850, store: 120 },
]

const lowStockItems = [
  { name: "Argentina Corned Beef 260g", sku: "CAN-ARG-001", current: 5, minimum: 20, status: "critical" },
  { name: "Eden Cheese 165g", sku: "DAI-EDN-001", current: 8, minimum: 15, status: "low" },
  { name: "Bear Brand Adult 300g", sku: "DAI-BBR-001", current: 12, minimum: 25, status: "low" },
  { name: "Kopiko 78C 240ml", sku: "BEV-KOP-001", current: 15, minimum: 30, status: "low" },
  { name: "Sky Flakes Crackers", sku: "SNK-SKY-001", current: 10, minimum: 20, status: "low" },
]

const stockMovement = [
  { item: "Lucky Me Pancit Canton", received: 500, sold: 450, adjustment: -5, net: 45 },
  { item: "Argentina Corned Beef", received: 200, sold: 280, adjustment: 0, net: -80 },
  { item: "Kopiko 78C", received: 600, sold: 520, adjustment: -10, net: 70 },
  { item: "C2 Apple Green Tea", received: 300, sold: 245, adjustment: 0, net: 55 },
  { item: "Oishi Prawn Crackers", received: 400, sold: 350, adjustment: -8, net: 42 },
]

export function InventoryReport({ dateRange }: InventoryReportProps) {
  const totalItems = stockStatusData.reduce((acc, item) => acc + item.value, 0)
  const totalValue = 2850000

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total SKUs</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Inventory Value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Items Needing Reorder</p>
          <p className="text-2xl font-bold text-amber-500">{stockStatusData[1].value + stockStatusData[2].value}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Stock Status Distribution</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Stock by Category & Tier</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStockData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="wholesale" name="Wholesale" fill="hsl(var(--chart-1))" stackId="a" />
                <Bar dataKey="retail" name="Retail" fill="hsl(var(--chart-2))" stackId="a" />
                <Bar dataKey="store" name="Store" fill="hsl(var(--chart-3))" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Low Stock Alerts</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Minimum Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.map((item) => (
              <TableRow key={item.sku}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{item.current}</span>
                    <Progress 
                      value={(item.current / item.minimum) * 100} 
                      className="h-2 w-16"
                    />
                  </div>
                </TableCell>
                <TableCell>{item.minimum}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "critical" ? "destructive" : "secondary"}>
                    {item.status === "critical" ? "Critical" : "Low"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Stock Movement Summary</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Sold</TableHead>
              <TableHead className="text-right">Adjustment</TableHead>
              <TableHead className="text-right">Net Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockMovement.map((item) => (
              <TableRow key={item.item}>
                <TableCell className="font-medium">{item.item}</TableCell>
                <TableCell className="text-right text-green-500">+{item.received}</TableCell>
                <TableCell className="text-right text-red-500">-{item.sold}</TableCell>
                <TableCell className="text-right text-muted-foreground">{item.adjustment}</TableCell>
                <TableCell className={`text-right font-medium ${item.net >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {item.net >= 0 ? `+${item.net}` : item.net}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
