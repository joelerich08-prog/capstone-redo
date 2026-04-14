'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { mockProducts } from '@/lib/mock-data/products'
import type { MovementType, InventoryTier } from '@/lib/types'
import { 
  Search, 
  ArrowDownToLine, 
  ArrowRightLeft, 
  Scissors, 
  ShoppingCart,
  ClipboardEdit,
  AlertTriangle,
  RotateCcw,
  Download,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/shared/table-pagination'

interface StockMovement {
  id: string
  productId: string
  productName: string
  movementType: MovementType
  fromTier?: InventoryTier
  toTier?: InventoryTier
  quantity: number
  reason?: string
  performedBy: string
  createdAt: Date
}

const movementTypeConfig: Record<MovementType, { label: string; icon: React.ReactNode; color: string }> = {
  receive: { label: 'Received', icon: <ArrowDownToLine className="size-4" />, color: 'bg-green-500/10 text-green-700 border-green-500/30' },
  breakdown: { label: 'Breakdown', icon: <Scissors className="size-4" />, color: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
  transfer: { label: 'Transfer', icon: <ArrowRightLeft className="size-4" />, color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
  sale: { label: 'Sale', icon: <ShoppingCart className="size-4" />, color: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
  adjustment: { label: 'Adjustment', icon: <ClipboardEdit className="size-4" />, color: 'bg-slate-500/10 text-slate-700 border-slate-500/30' },
  damage: { label: 'Damage', icon: <AlertTriangle className="size-4" />, color: 'bg-red-500/10 text-red-700 border-red-500/30' },
  return: { label: 'Return', icon: <RotateCcw className="size-4" />, color: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30' },
}

const tierLabels: Record<InventoryTier, string> = {
  wholesale: 'Wholesale',
  retail: 'Retail',
  shelf: 'Shelf',
}

// Generate mock movement history
function generateMockMovements(): StockMovement[] {
  const movements: StockMovement[] = []
  const users = ['Admin User', 'Juan Dela Cruz', 'Maria Santos', 'Carlos Mendoza']
  const types: MovementType[] = ['receive', 'breakdown', 'transfer', 'sale', 'adjustment', 'damage', 'return']
  
  for (let i = 0; i < 50; i++) {
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    
    let fromTier: InventoryTier | undefined
    let toTier: InventoryTier | undefined
    let reason: string | undefined

    if (type === 'breakdown') {
      fromTier = Math.random() > 0.5 ? 'wholesale' : 'retail'
      toTier = fromTier === 'wholesale' ? 'retail' : 'shelf'
    } else if (type === 'transfer') {
      fromTier = 'retail'
      toTier = 'shelf'
    } else if (type === 'receive') {
      toTier = Math.random() > 0.5 ? 'wholesale' : 'retail'
    } else if (type === 'sale') {
      fromTier = 'shelf'
    } else if (type === 'damage') {
      fromTier = ['wholesale', 'retail', 'shelf'][Math.floor(Math.random() * 3)] as InventoryTier
      reason = ['Damaged packaging', 'Water damage', 'Pest damage'][Math.floor(Math.random() * 3)]
    } else if (type === 'adjustment') {
      fromTier = ['wholesale', 'retail', 'shelf'][Math.floor(Math.random() * 3)] as InventoryTier
      reason = ['Stock count correction', 'System error fix', 'Found misplaced items'][Math.floor(Math.random() * 3)]
    } else if (type === 'return') {
      toTier = 'shelf'
      reason = 'Customer return'
    }

    movements.push({
      id: `mov_${String(i + 1).padStart(4, '0')}`,
      productId: product.id,
      productName: product.name,
      movementType: type,
      fromTier,
      toTier,
      quantity: Math.floor(Math.random() * 50) + 1,
      reason,
      performedBy: users[Math.floor(Math.random() * users.length)],
      createdAt: new Date(Date.now() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000),
    })
  }

  return movements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

const mockMovements = generateMockMovements()

export default function MovementsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')

  const filteredMovements = mockMovements.filter(movement => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.performedBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || movement.movementType === typeFilter
    const matchesTier = tierFilter === 'all' || 
      movement.fromTier === tierFilter || 
      movement.toTier === tierFilter
    return matchesSearch && matchesType && matchesTier
  })

  const pagination = usePagination(filteredMovements, { itemsPerPage: 10 })

  const stats = {
    received: mockMovements.filter(m => m.movementType === 'receive').reduce((sum, m) => sum + m.quantity, 0),
    breakdown: mockMovements.filter(m => m.movementType === 'breakdown').length,
    transfers: mockMovements.filter(m => m.movementType === 'transfer').length,
    sales: mockMovements.filter(m => m.movementType === 'sale').reduce((sum, m) => sum + m.quantity, 0),
  }

  const handleExport = () => {
    // CSV header
    const header = 'ID,Product,Movement Type,From Tier,To Tier,Quantity,Reason,Performed By,Date'
    
    // CSV rows
    const rows = filteredMovements.map(m => {
      const fromTier = m.fromTier ? tierLabels[m.fromTier] : ''
      const toTier = m.toTier ? tierLabels[m.toTier] : ''
      const reason = m.reason ? `"${m.reason.replace(/"/g, '""')}"` : ''
      const productName = `"${m.productName.replace(/"/g, '""')}"`
      
      return `${m.id},${productName},${movementTypeConfig[m.movementType].label},${fromTier},${toTier},${m.quantity},${reason},${m.performedBy},${format(m.createdAt, 'yyyy-MM-dd HH:mm')}`
    }).join('\n')
    
    const csv = `${header}\n${rows}`
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `stock-movements-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardShell
      title="Stock Movements"
      description="Track all inventory changes and movements"
      allowedRoles={['admin', 'stockman']}
    >
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-green-500/10">
                <ArrowDownToLine className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.received.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Units Received</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10">
                <Scissors className="size-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.breakdown}</p>
                <p className="text-sm text-muted-foreground">Breakdowns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10">
                <ArrowRightLeft className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.transfers}</p>
                <p className="text-sm text-muted-foreground">Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-purple-500/10">
                <ShoppingCart className="size-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.sales.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Units Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex flex-1 flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(movementTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="shelf">Shelf</SelectItem>
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
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Movement</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paginatedItems.map((movement) => {
                  const config = movementTypeConfig[movement.movementType]
                  return (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        <div>{format(movement.createdAt, 'MMM d, yyyy')}</div>
                        <div className="text-muted-foreground text-xs">
                          {format(movement.createdAt, 'h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{movement.productName}</div>
                        {movement.reason && (
                          <div className="text-xs text-muted-foreground">{movement.reason}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.color}>
                          <span className="mr-1">{config.icon}</span>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.fromTier && movement.toTier ? (
                          <span>
                            {tierLabels[movement.fromTier]} → {tierLabels[movement.toTier]}
                          </span>
                        ) : movement.toTier ? (
                          <span>→ {tierLabels[movement.toTier]}</span>
                        ) : movement.fromTier ? (
                          <span>{tierLabels[movement.fromTier]} →</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.performedBy}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

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
    </DashboardShell>
  )
}
