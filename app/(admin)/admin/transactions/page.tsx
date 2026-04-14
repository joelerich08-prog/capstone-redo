'use client'

import { useState, useMemo } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useTransactions } from '@/contexts/transaction-context'
import { mockUsers } from '@/lib/mock-data/users'
import { formatPeso } from '@/lib/utils/currency'
import { format, startOfDay, endOfDay, subDays, isWithinInterval } from 'date-fns'
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/shared/table-pagination'
import {
  Search,
  Eye,
  CalendarIcon,
  Download,
  Banknote,
  Smartphone,
  CreditCard,
  Receipt,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { Transaction } from '@/lib/types'
import type { DateRange } from 'react-day-picker'

const paymentMethodConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  cash: { label: 'Cash', icon: Banknote, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  gcash: { label: 'GCash', icon: Smartphone, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  maya: { label: 'Maya', icon: CreditCard, color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
}

// Get cashier name from user ID
function getCashierName(cashierId: string): string {
  const user = mockUsers.find(u => u.id === cashierId)
  return user?.name || 'Unknown Cashier'
}

// Get unique cashiers from transactions - will be called in component with real data
function getUniqueCashiersFromTransactions(transactions: Transaction[]): { id: string; name: string }[] {
  const cashierIds = [...new Set(transactions.map(t => t.cashierId))]
  return cashierIds.map(id => ({
    id,
    name: getCashierName(id),
  }))
}

export default function TransactionsPage() {
  const { transactions } = useTransactions()
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [cashierFilter, setCashierFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const cashiers = getUniqueCashiersFromTransactions(transactions)

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      // Search filter (invoice number or product names)
      const matchesSearch = search === '' ||
        txn.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        txn.items.some(item => item.productName.toLowerCase().includes(search.toLowerCase()))

      // Payment method filter
      const matchesPayment = paymentFilter === 'all' || txn.paymentType === paymentFilter

      // Cashier filter
      const matchesCashier = cashierFilter === 'all' || txn.cashierId === cashierFilter

      // Date range filter
      let matchesDate = true
      if (dateRange?.from) {
        const txnDate = new Date(txn.createdAt)
        const from = startOfDay(dateRange.from)
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
        matchesDate = isWithinInterval(txnDate, { start: from, end: to })
      }

      return matchesSearch && matchesPayment && matchesCashier && matchesDate
    })
  }, [search, paymentFilter, cashierFilter, dateRange, transactions])

  const pagination = usePagination(filteredTransactions, { itemsPerPage: 10 })

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalSales = filteredTransactions.reduce((sum, txn) => sum + txn.total, 0)
    const totalTransactions = filteredTransactions.length
    const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const paymentBreakdown = filteredTransactions.reduce((acc, txn) => {
      acc[txn.paymentType] = (acc[txn.paymentType] || 0) + txn.total
      return acc
    }, {} as Record<string, number>)

    return { totalSales, totalTransactions, avgTransaction, paymentBreakdown }
  }, [filteredTransactions])

  const handleExport = () => {
    // In a real app, this would generate and download a CSV/Excel file
    const csvContent = [
      ['Invoice', 'Date', 'Time', 'Cashier', 'Items', 'Payment', 'Total'].join(','),
      ...filteredTransactions.map(txn => [
        txn.invoiceNo,
        format(new Date(txn.createdAt), 'yyyy-MM-dd'),
        format(new Date(txn.createdAt), 'HH:mm'),
        getCashierName(txn.cashierId),
        txn.items.length,
        txn.paymentType,
        txn.total,
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardShell
      title="Transactions"
      description="View all transactions from all cashiers"
      allowedRoles={['admin']}
      headerAction={
        <Button variant="outline" onClick={handleExport}>
          <Download className="size-4 mr-2" />
          Export CSV
        </Button>
      }
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold tabular-nums">{formatPeso(stats.totalSales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold tabular-nums">{stats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                <p className="text-2xl font-bold tabular-nums">{formatPeso(stats.avgTransaction)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">By Payment Method</p>
              <div className="space-y-1">
                {Object.entries(stats.paymentBreakdown).map(([method, total]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span className="capitalize">{method}</span>
                    <span className="tabular-nums font-medium">{formatPeso(total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[240px] justify-start">
                  <CalendarIcon className="size-4 mr-2" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    'Select date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="maya">Maya</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cashierFilter} onValueChange={setCashierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cashier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cashiers</SelectItem>
                {cashiers.map(cashier => (
                  <SelectItem key={cashier.id} value={cashier.id}>
                    {cashier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.map(txn => {
                const paymentConfig = paymentMethodConfig[txn.paymentType]
                const PaymentIcon = paymentConfig?.icon || Banknote
                return (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.invoiceNo}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{format(new Date(txn.createdAt), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(txn.createdAt), 'h:mm a')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getCashierName(txn.cashierId)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{txn.items.length} item{txn.items.length !== 1 ? 's' : ''}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${paymentConfig?.color}`}>
                        <PaymentIcon className="size-3 mr-1" />
                        {paymentConfig?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPeso(txn.subtotal)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {txn.discount > 0 ? `-${formatPeso(txn.discount)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatPeso(txn.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setSelectedTransaction(txn)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found matching your filters.
            </div>
          )}

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
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-lg">
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTransaction.invoiceNo}
                  <Badge className={paymentMethodConfig[selectedTransaction.paymentType]?.color}>
                    {paymentMethodConfig[selectedTransaction.paymentType]?.label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedTransaction.createdAt), 'PPP p')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Cashier Info */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Processed by</p>
                  <p className="font-medium">{getCashierName(selectedTransaction.cashierId)}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedTransaction.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="tabular-nums">{formatPeso(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPeso(selectedTransaction.subtotal)}</span>
                  </div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Discount</span>
                      <span className="tabular-nums">-{formatPeso(selectedTransaction.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPeso(selectedTransaction.total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
