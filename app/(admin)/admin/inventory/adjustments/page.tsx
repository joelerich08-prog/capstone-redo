'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { mockProducts } from '@/lib/mock-data/products'
import { useInventory } from '@/contexts/inventory-context'
import { useAuth } from '@/contexts/auth-context'
import type { InventoryTier } from '@/lib/types'
import { Package, Plus, Minus, AlertTriangle, Check, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

type AdjustmentType = 'add' | 'subtract'
type AdjustmentReason = 'damage' | 'expiry' | 'theft' | 'correction' | 'other'

interface AdjustmentHistory {
  id: string
  date: Date
  productName: string
  tier: string
  type: AdjustmentType
  quantity: number
  reason: AdjustmentReason
  notes?: string
  performedBy: string
}

const reasonLabels: Record<AdjustmentReason, string> = {
  damage: 'Damaged Goods',
  expiry: 'Expired Products',
  theft: 'Theft/Loss',
  correction: 'Stock Correction',
  other: 'Other',
}

const mockAdjustmentHistory: AdjustmentHistory[] = [
  {
    id: 'adj_001',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3),
    productName: 'Lucky Sardines',
    tier: 'shelf',
    type: 'subtract',
    quantity: 5,
    reason: 'damage',
    notes: 'Cans dented during restocking',
    performedBy: 'Juan Dela Cruz',
  },
  {
    id: 'adj_002',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    productName: 'Eden Cheese',
    tier: 'retail',
    type: 'subtract',
    quantity: 10,
    reason: 'expiry',
    notes: 'Products past expiration date',
    performedBy: 'Admin User',
  },
  {
    id: 'adj_003',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    productName: 'Coca-Cola',
    tier: 'shelf',
    type: 'add',
    quantity: 12,
    reason: 'correction',
    notes: 'Found misplaced items in storage',
    performedBy: 'Maria Santos',
  },
]

export default function AdjustmentsPage() {
  const { getInventory, getStock, adjustStock } = useInventory()
  const { user } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [tier, setTier] = useState<InventoryTier>('shelf')
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('subtract')
  const [quantity, setQuantity] = useState<number>(1)
  const [reason, setReason] = useState<AdjustmentReason>('damage')
  const [notes, setNotes] = useState<string>('')
  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentHistory[]>(mockAdjustmentHistory)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const inventory = selectedProduct ? getInventory(selectedProduct) : null
  const product = selectedProduct 
    ? mockProducts.find(p => p.id === selectedProduct)
    : null

  const currentStock = selectedProduct ? getStock(selectedProduct, tier) : 0

  const handleSubmitClick = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error('Please select a product and quantity')
      return
    }

    if (adjustmentType === 'subtract' && quantity > currentStock) {
      toast.error('Cannot subtract more than current stock')
      return
    }

    if (!notes.trim()) {
      toast.error('Please provide notes for this adjustment')
      return
    }

    setIsConfirmOpen(true)
  }

  const handleConfirmAdjustment = () => {
    if (!selectedProduct || !product) return

    const result = adjustStock(
      selectedProduct,
      tier,
      adjustmentType === 'add' ? quantity : -quantity,
      reason,
      notes.trim(),
      user?.name || 'Unknown User'
    )

    if (result.success) {
      // Add to adjustment history
      const newAdjustment: AdjustmentHistory = {
        id: `adj_${Date.now()}`,
        date: new Date(),
        productName: product.name,
        tier,
        type: adjustmentType,
        quantity,
        reason,
        notes: notes.trim(),
        performedBy: user?.name || 'Unknown User',
      }
      setAdjustmentHistory(prev => [newAdjustment, ...prev])

      const action = adjustmentType === 'add' ? 'Added' : 'Removed'
      toast.success(
        `${action} ${quantity} unit(s) ${adjustmentType === 'add' ? 'to' : 'from'} ${product.name}`
      )
      
      setSelectedProduct('')
      setQuantity(1)
      setNotes('')
    } else {
      toast.error(result.error || 'Adjustment failed')
    }
    setIsConfirmOpen(false)
  }

  return (
    <DashboardShell
      title="Stock Adjustments"
      description="Record inventory adjustments for damages, expiry, or corrections"
      allowedRoles={['admin', 'stockman']}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Adjustment Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New Adjustment</CardTitle>
            <CardDescription>
              Adjust stock levels with proper documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Select Product</FieldLabel>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map(prod => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.name} ({prod.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Stock Tier</FieldLabel>
                  <Select 
                    value={tier} 
                    onValueChange={(v) => setTier(v as InventoryTier)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="shelf">Shelf</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Adjustment Type</FieldLabel>
                  <Select 
                    value={adjustmentType} 
                    onValueChange={(v) => setAdjustmentType(v as AdjustmentType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtract">
                        <span className="flex items-center gap-2">
                          <Minus className="size-4 text-red-500" />
                          Remove Stock
                        </span>
                      </SelectItem>
                      <SelectItem value="add">
                        <span className="flex items-center gap-2">
                          <Plus className="size-4 text-green-500" />
                          Add Stock
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>
                    Quantity
                    {inventory && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        (Current: {currentStock})
                      </span>
                    )}
                  </FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    disabled={!selectedProduct}
                  />
                </Field>

                <Field>
                  <FieldLabel>Reason</FieldLabel>
                  <Select 
                    value={reason} 
                    onValueChange={(v) => setReason(v as AdjustmentReason)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(reasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel>Notes (required)</FieldLabel>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the reason for this adjustment..."
                  rows={3}
                />
              </Field>
            </FieldGroup>

            {selectedProduct && product && (
              <div className={`rounded-lg p-4 ${adjustmentType === 'subtract' ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {adjustmentType === 'subtract' ? (
                    <AlertTriangle className="size-5 text-red-500" />
                  ) : (
                    <Plus className="size-5 text-green-500" />
                  )}
                  <span className="font-medium">Adjustment Preview</span>
                </div>
                <p className="text-sm">
                  {adjustmentType === 'subtract' ? 'Removing' : 'Adding'}{' '}
                  <span className="font-bold">{quantity}</span> unit(s){' '}
                  {adjustmentType === 'subtract' ? 'from' : 'to'}{' '}
                  <span className="font-bold">{product.name}</span> ({tier})
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  After adjustment: {adjustmentType === 'subtract' ? currentStock - quantity : currentStock + quantity} units
                </p>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleSubmitClick}
              disabled={!selectedProduct || quantity <= 0 || !notes.trim()}
              variant={adjustmentType === 'subtract' ? 'destructive' : 'default'}
            >
              <Check className="mr-2 size-4" />
              Confirm Adjustment
            </Button>
          </CardContent>
        </Card>

        {/* Recent Adjustments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Adjustments</CardTitle>
            <CardDescription>Latest stock changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adjustmentHistory.map((adj) => (
                <div key={adj.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">{adj.productName}</span>
                    <Badge 
                      variant={adj.type === 'add' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {adj.type === 'add' ? '+' : '-'}{adj.quantity}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <span className="capitalize">{adj.tier}</span>
                      <span className="mx-1">|</span>
                      {reasonLabels[adj.reason]}
                    </p>
                    {adj.notes && (
                      <p className="text-xs italic">&quot;{adj.notes}&quot;</p>
                    )}
                    <p className="text-xs">
                      {adj.performedBy} | {format(adj.date, 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {adjustmentType === 'subtract' ? 'Confirm Stock Removal' : 'Confirm Stock Addition'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {product && (
                <>
                  You are about to <strong>{adjustmentType === 'subtract' ? 'remove' : 'add'} {quantity} unit(s)</strong>{' '}
                  {adjustmentType === 'subtract' ? 'from' : 'to'} <strong>{product.name}</strong> ({tier} stock).
                  <br /><br />
                  <strong>Reason:</strong> {reasonLabels[reason]}
                  <br />
                  <strong>Notes:</strong> {notes}
                  <br /><br />
                  This action will be logged. Do you want to proceed?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAdjustment}
              className={adjustmentType === 'subtract' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirm {adjustmentType === 'subtract' ? 'Removal' : 'Addition'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
