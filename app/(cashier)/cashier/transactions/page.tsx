"use client"

import { useState, useMemo, useEffect } from "react"
import { CashierShell } from "@/components/layout/cashier-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "@/components/shared/date-range-picker"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTransactions } from "@/contexts/transaction-context"
import { formatCurrency } from "@/lib/utils/currency"
import { format, addDays, isToday, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Download } from "lucide-react"
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/shared/table-pagination'

const paymentMethodColors: Record<string, string> = {
  cash: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  gcash: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  maya: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
}

export default function CashierTransactionsPage() {
  const { transactions } = useTransactions()
  const [viewMode, setViewMode] = useState<"today" | "all">("today")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isClient, setIsClient] = useState(false)

  // Initialize date range on client only to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setDateRange({
      from: addDays(new Date(), -7),
      to: new Date(),
    })
  }, [])

  // Filter transactions based on view mode - only calculate on client to avoid hydration mismatch
  const filteredTransactions = useMemo(() => {
    if (!isClient) return []
    
    if (viewMode === "today") {
      return transactions.filter(t => isToday(new Date(t.createdAt)))
    }
    
    // "all" mode with date range filter
    if (dateRange?.from && dateRange?.to) {
      return transactions.filter(t => {
        const txnDate = new Date(t.createdAt)
        return isWithinInterval(txnDate, {
          start: startOfDay(dateRange.from!),
          end: endOfDay(dateRange.to!),
        })
      })
    }
    
    return transactions
  }, [viewMode, dateRange, isClient, transactions])

  // Calculate stats based on filtered transactions
  const stats = useMemo(() => {
    if (!isClient) return { totalSales: 0, count: 0, average: 0 }
    const totalSales = filteredTransactions.reduce((acc, t) => acc + t.total, 0)
    const count = filteredTransactions.length
    const average = count > 0 ? totalSales / count : 0
    return { totalSales, count, average }
  }, [filteredTransactions, isClient])

  const pagination = usePagination(filteredTransactions, { itemsPerPage: 10 })

  return (
    <CashierShell title="Transactions" description="View and manage your transactions">
      {/* View Mode Toggle & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "today" | "all")}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        {viewMode === "all" && isClient && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {viewMode === "today" ? "Today's Sales" : "Total Sales"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isClient ? formatCurrency(stats.totalSales) : "..."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isClient ? stats.count : "..."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isClient ? formatCurrency(stats.average) : "..."}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === "today" ? "Today's Transactions" : "All Transactions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>{viewMode === "today" ? "Time" : "Date & Time"}</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                {viewMode === "all" && <TableHead>Status</TableHead>}
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={viewMode === "all" ? 6 : 5} className="h-24 text-center text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                pagination.paginatedItems.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell>
                      {viewMode === "today" 
                        ? format(new Date(txn.createdAt), "HH:mm")
                        : format(new Date(txn.createdAt), "MMM d, yyyy HH:mm")
                      }
                    </TableCell>
                    <TableCell>{txn.items.length} items</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={paymentMethodColors[txn.paymentType]}>
                        {txn.paymentType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    {viewMode === "all" && (
                      <TableCell>
                        <Badge variant={txn.status === "completed" ? "default" : "secondary"}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(txn.total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination.paginatedItems.length > 0 && (
            <TablePagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.goToPage}
              onPrevPage={pagination.goToPrevPage}
              onNextPage={pagination.goToNextPage}
              onItemsPerPageChange={pagination.setItemsPerPage}
            />
          )}
        </CardContent>
      </Card>
    </CashierShell>
  )
}
