'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useBatches } from '@/contexts/batch-context'
import { useInventory } from '@/contexts/inventory-context'
import { useAuth } from '@/contexts/auth-context'
import { mockProducts } from '@/lib/mock-data/products'
import { formatCurrency } from '@/lib/utils/currency'
import { EXPIRY_WARNING_DAYS, EXPIRY_CRITICAL_DAYS } from '@/lib/mock-data/batches'
import { 
  Clock, 
  AlertTriangle, 
  Package, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  ArrowDown,
  CheckCircle,
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'

export default function ExpiryManagementPage() {
  const { 
    batches, 
    getExpiringBatches, 
    getExpiredBatches, 
    getCriticalBatches,
    getBatchSummary,
    disposeBatch,
  } = useBatches()
  const { adjustStock } = useInventory()
  const { user } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [showDisposeDialog, setShowDisposeDialog] = useState(false)
  const [disposeReason, setDisposeReason] = useState('')
  const [showBatchDetails, setShowBatchDetails] = useState(false)

  const summary = getBatchSummary()
  const criticalBatches = getCriticalBatches()
  const expiringBatches = getExpiringBatches()
  const expiredBatches = getExpiredBatches()

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const product = mockProducts.find(p => p.id === batch.productId)
    const matchesSearch = 
      product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'critical') {
      const days = differenceInDays(batch.expirationDate, new Date())
      return matchesSearch && days > 0 && days <= EXPIRY_CRITICAL_DAYS && batch.status !== 'disposed'
    }
    if (statusFilter === 'expiring_soon') {
      const days = differenceInDays(batch.expirationDate, new Date())
      return matchesSearch && days > 0 && days <= EXPIRY_WARNING_DAYS && batch.status !== 'disposed'
    }
    return matchesSearch && batch.status === statusFilter
  }).sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())

  const handleDispose = () => {
    if (!selectedBatchId) return
    
    const userName = user?.name || 'Admin'
    // Pass inventory sync callback and username to sync with main inventory
    const result = disposeBatch(selectedBatchId, disposeReason, adjustStock, userName)
    if (result.success) {
      const total = result.disposedQuantities 
        ? result.disposedQuantities.wholesale + result.disposedQuantities.retail + result.disposedQuantities.shelf 
        : 0
      toast.success(`Batch disposed. ${total} units removed from inventory.`)
      setShowDisposeDialog(false)
      setSelectedBatchId(null)
      setDisposeReason('')
    } else {
      toast.error(result.error || 'Failed to dispose batch')
    }
  }

  const getStatusBadge = (batch: typeof batches[0]) => {
    const now = new Date()
    const daysUntilExpiry = differenceInDays(batch.expirationDate, now)
    
    if (batch.status === 'disposed') {
      return <Badge variant="secondary" className="bg-slate-500/10 text-slate-600">Disposed</Badge>
    }
    if (daysUntilExpiry <= 0) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (daysUntilExpiry <= EXPIRY_CRITICAL_DAYS) {
      return <Badge variant="destructive" className="animate-pulse">Critical</Badge>
    }
    if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
      return <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-500/30">Expiring Soon</Badge>
    }
    return <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/30">Active</Badge>
  }

  const getExpiryDisplay = (batch: typeof batches[0]) => {
    const now = new Date()
    const daysUntilExpiry = differenceInDays(batch.expirationDate, now)
    
    if (batch.status === 'disposed') {
      return <span className="text-muted-foreground">N/A</span>
    }
    if (daysUntilExpiry <= 0) {
      return (
        <span className="text-destructive font-medium">
          Expired {Math.abs(daysUntilExpiry)} days ago
        </span>
      )
    }
    if (daysUntilExpiry <= EXPIRY_CRITICAL_DAYS) {
      return (
        <span className="text-destructive font-medium">
          {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} left
        </span>
      )
    }
    if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
      return (
        <span className="text-orange-600 font-medium">
          {daysUntilExpiry} days left
        </span>
      )
    }
    return (
      <span className="text-muted-foreground">
        {daysUntilExpiry} days left
      </span>
    )
  }

  const selectedBatch = selectedBatchId ? batches.find(b => b.id === selectedBatchId) : null
  const selectedProduct = selectedBatch ? mockProducts.find(p => p.id === selectedBatch.productId) : null

  return (
    <DashboardShell
      title="Expiry Management"
      description="Track and manage product batches and expiration dates"
      allowedRoles={['admin', 'stockman']}
    >
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Package className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-sm text-muted-foreground">Total Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={criticalBatches.length > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalBatches.length}</p>
                <p className="text-sm text-muted-foreground">Critical ({`<`}{EXPIRY_CRITICAL_DAYS}d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={summary.expiringSoon > 0 ? 'border-orange-500/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10">
                <Clock className="size-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.expiringSoon}</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-amber-500/10">
                <DollarSign className="size-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(summary.valueAtRisk)}</p>
                <p className="text-sm text-muted-foreground">Value at Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalBatches.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="size-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">
                  {criticalBatches.length} Batch{criticalBatches.length > 1 ? 'es' : ''} Expiring Within {EXPIRY_CRITICAL_DAYS} Days
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  These items require immediate attention. Consider discounting, transferring, or disposing.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {criticalBatches.slice(0, 5).map(batch => {
                    const product = mockProducts.find(p => p.id === batch.productId)
                    const days = differenceInDays(batch.expirationDate, new Date())
                    return (
                      <Badge key={batch.id} variant="destructive" className="cursor-pointer" onClick={() => {
                        setSelectedBatchId(batch.id)
                        setShowBatchDetails(true)
                      }}>
                        {product?.name} ({days}d)
                      </Badge>
                    )
                  })}
                  {criticalBatches.length > 5 && (
                    <Badge variant="secondary">+{criticalBatches.length - 5} more</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Batches</CardTitle>
              <CardDescription>Manage product batches and expiration dates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by product or batch number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="critical">Critical ({`<`}{EXPIRY_CRITICAL_DAYS} days)</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Batches Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Expiry Date
                      <ArrowDown className="size-3" />
                    </div>
                  </TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => {
                  const product = mockProducts.find(p => p.id === batch.productId)
                  const totalQty = batch.wholesaleQty + batch.retailQty + batch.shelfQty
                  const value = totalQty * batch.costPrice
                  
                  return (
                    <TableRow 
                      key={batch.id} 
                      className={batch.status === 'disposed' ? 'opacity-50' : ''}
                    >
                      <TableCell>
                        <div>
                          <span className="font-medium">{product?.name || 'Unknown'}</span>
                          <p className="text-xs text-muted-foreground">{product?.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {batch.batchNumber}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(batch)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          {format(batch.expirationDate, 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>{getExpiryDisplay(batch)}</TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          <span className="tabular-nums">{totalQty}</span>
                          <span className="text-muted-foreground text-xs ml-1">units</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          W:{batch.wholesaleQty} R:{batch.retailQty} S:{batch.shelfQty}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(value)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBatchId(batch.id)
                              setShowBatchDetails(true)
                            }}
                          >
                            <Package className="size-4" />
                          </Button>
                          {batch.status !== 'disposed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedBatchId(batch.id)
                                setShowDisposeDialog(true)
                              }}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredBatches.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Package className="size-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No batches found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dispose Confirmation Dialog */}
      <AlertDialog open={showDisposeDialog} onOpenChange={setShowDisposeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dispose Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dispose this batch? This will mark all stock in this batch as disposed and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedBatch && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="font-medium">{selectedProduct?.name}</p>
              <p className="text-sm text-muted-foreground">Batch: {selectedBatch.batchNumber}</p>
              <p className="text-sm text-muted-foreground">
                Stock: {selectedBatch.wholesaleQty + selectedBatch.retailQty + selectedBatch.shelfQty} units
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for disposal</label>
            <Textarea
              placeholder="e.g., Expired, Damaged, Quality issue..."
              value={disposeReason}
              onChange={(e) => setDisposeReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedBatchId(null)
              setDisposeReason('')
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDispose} className="bg-destructive hover:bg-destructive/90">
              Dispose Batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Details Dialog */}
      <Dialog open={showBatchDetails} onOpenChange={setShowBatchDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Batch Details</DialogTitle>
            <DialogDescription>
              View detailed information about this batch
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.sku}</p>
                </div>
                {getStatusBadge(selectedBatch)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Batch Number</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{selectedBatch.batchNumber}</code>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Invoice</p>
                  <p className="text-sm font-medium">{selectedBatch.invoiceNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Received Date</p>
                  <p className="text-sm font-medium">{format(selectedBatch.receivedDate, 'MMM d, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Expiration Date</p>
                  <p className="text-sm font-medium">{format(selectedBatch.expirationDate, 'MMM d, yyyy')}</p>
                </div>
                {selectedBatch.manufacturingDate && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Manufacturing Date</p>
                    <p className="text-sm font-medium">{format(selectedBatch.manufacturingDate, 'MMM d, yyyy')}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cost Price</p>
                  <p className="text-sm font-medium">{formatCurrency(selectedBatch.costPrice)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Stock Levels</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{selectedBatch.wholesaleQty}</p>
                    <p className="text-xs text-muted-foreground">Wholesale</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{selectedBatch.retailQty}</p>
                    <p className="text-xs text-muted-foreground">Retail</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{selectedBatch.shelfQty}</p>
                    <p className="text-xs text-muted-foreground">Shelf</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(
                        (selectedBatch.wholesaleQty + selectedBatch.retailQty + selectedBatch.shelfQty) * 
                        selectedBatch.costPrice
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Initial Quantity</p>
                    <p className="text-lg font-bold">{selectedBatch.initialQty}</p>
                  </div>
                </div>
              </div>

              {selectedBatch.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedBatch.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDetails(false)}>
              Close
            </Button>
            {selectedBatch && selectedBatch.status !== 'disposed' && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowBatchDetails(false)
                  setShowDisposeDialog(true)
                }}
              >
                <Trash2 className="size-4 mr-2" />
                Dispose Batch
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
