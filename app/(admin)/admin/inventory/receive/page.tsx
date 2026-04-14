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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { mockProducts } from '@/lib/mock-data/products'
import { mockSuppliers } from '@/lib/mock-data/suppliers'
import { useInventory } from '@/contexts/inventory-context'
import { useBatches } from '@/contexts/batch-context'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency } from '@/lib/utils/currency'
import { generateBatchNumber } from '@/lib/mock-data/batches'
import { Truck, Plus, Trash2, Check, Calendar, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { format, addDays, differenceInDays } from 'date-fns'

interface ReceiveItem {
  productId: string
  productName: string
  quantity: number
  tier: 'wholesale' | 'retail'
  unitCost: number
  batchNumber: string
  expirationDate: Date
  manufacturingDate?: Date
}

interface ReceiveHistory {
  id: string
  date: Date
  supplier: string
  items: number
  totalCost: number
  status: 'completed' | 'pending'
}

const initialReceiveHistory: ReceiveHistory[] = [
  {
    id: 'rcv_001',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    supplier: 'Metro Distributors Inc.',
    items: 5,
    totalCost: 12500,
    status: 'completed',
  },
  {
    id: 'rcv_002',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    supplier: 'Golden Harvest Trading',
    items: 8,
    totalCost: 28000,
    status: 'completed',
  },
  {
    id: 'rcv_003',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    supplier: 'Pacific Beverage Co.',
    items: 3,
    totalCost: 15600,
    status: 'completed',
  },
]

export default function ReceiveStockPage() {
  const { receiveStock } = useInventory()
  const { addBatch } = useBatches()
  const { user } = useAuth()
  const [receiveHistory, setReceiveHistory] = useState<ReceiveHistory[]>(initialReceiveHistory)
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [tier, setTier] = useState<'wholesale' | 'retail'>('wholesale')
  const [unitCost, setUnitCost] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [items, setItems] = useState<ReceiveItem[]>([])
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${Date.now()}`)
  
  // Batch/Expiry fields
  const [batchNumber, setBatchNumber] = useState<string>(generateBatchNumber())
  const [expirationDate, setExpirationDate] = useState<string>(
    format(addDays(new Date(), 180), 'yyyy-MM-dd')
  )
  const [manufacturingDate, setManufacturingDate] = useState<string>('')

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error('Please select a product and quantity')
      return
    }

    if (!expirationDate) {
      toast.error('Please enter an expiration date')
      return
    }

    const product = mockProducts.find(p => p.id === selectedProduct)
    if (!product) return

    const expDate = new Date(expirationDate)
    const daysUntilExpiry = differenceInDays(expDate, new Date())
    
    if (daysUntilExpiry <= 0) {
      toast.error('Expiration date must be in the future')
      return
    }

    if (daysUntilExpiry <= 30) {
      toast.warning('Warning: Product expires in less than 30 days')
    }

    const existingIndex = items.findIndex(
      item => item.productId === selectedProduct && 
              item.tier === tier && 
              item.batchNumber === batchNumber
    )

    if (existingIndex >= 0) {
      const updated = [...items]
      updated[existingIndex].quantity += quantity
      setItems(updated)
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct,
          productName: product.name,
          quantity,
          tier,
          unitCost: unitCost || product.costPrice,
          batchNumber,
          expirationDate: expDate,
          manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : undefined,
        },
      ])
    }

    // Reset fields for next item
    setSelectedProduct('')
    setQuantity(1)
    setUnitCost(0)
    setBatchNumber(generateBatchNumber())
    setManufacturingDate('')
    toast.success(`Added ${product.name} to receive list`)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!selectedSupplier) {
      toast.error('Please select a supplier')
      return
    }
    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    const totalCostValue = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
    const supplier = mockSuppliers.find(s => s.id === selectedSupplier)
    const userName = user?.name || 'Admin'

    // Create batches for each item - use item's tier, not form-level tier
    items.forEach(item => {
      const inventory = item.tier === 'wholesale' 
        ? { wholesaleQty: item.quantity, retailQty: 0, shelfQty: 0 }
        : { wholesaleQty: 0, retailQty: item.quantity, shelfQty: 0 }

      addBatch({
        productId: item.productId,
        batchNumber: item.batchNumber,
        expirationDate: item.expirationDate,
        manufacturingDate: item.manufacturingDate,
        receivedDate: new Date(),
        ...inventory,
        initialQty: item.quantity,
        costPrice: item.unitCost,
        supplierId: selectedSupplier,
        invoiceNumber: invoiceNumber,
        notes: notes || undefined,
      })
    })

    // Transform items to match receiveStock expected format, including tier
    const receiveItems = items.map(item => ({
      productId: item.productId,
      variantId: item.productId,
      variantName: item.tier === 'wholesale' ? 'Box' : 'Pack',
      productName: item.productName,
      quantity: item.quantity,
      cost: item.unitCost,
      tier: item.tier,  // Pass the tier to inventory context
    }))

    const result = receiveStock(
      receiveItems,
      supplier?.name || 'Unknown Supplier',
      invoiceNumber,
      userName
    )

    if (result.success) {
      const newReceipt: ReceiveHistory = {
        id: `rcv_${Date.now()}`,
        date: new Date(),
        supplier: supplier?.name || 'Unknown Supplier',
        items: items.length,
        totalCost: totalCostValue,
        status: 'completed',
      }
      
      setReceiveHistory(prev => [newReceipt, ...prev])
      toast.success(`Received ${items.length} items with batch tracking`)
      setItems([])
      setSelectedSupplier('')
      setNotes('')
      setInvoiceNumber(`INV-${Date.now()}`)
    } else {
      toast.error(result.error || 'Failed to receive stock')
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)

  return (
    <DashboardShell
      title="Receive Stock"
      description="Record incoming inventory from suppliers with batch tracking"
      allowedRoles={['admin', 'stockman']}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Receive Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New Stock Receipt</CardTitle>
            <CardDescription>
              Add products received from suppliers with expiration tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Supplier</FieldLabel>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSuppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Invoice Number</FieldLabel>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2024-001"
                  />
                </Field>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-4">Add Product</h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Product</FieldLabel>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProducts.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Stock Tier</FieldLabel>
                    <Select value={tier} onValueChange={(v) => setTier(v as 'wholesale' | 'retail')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wholesale">Wholesale (Boxes)</SelectItem>
                        <SelectItem value="retail">Retail (Packs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Quantity</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Unit Cost (optional)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={unitCost || ''}
                      onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                      placeholder="Use default cost"
                    />
                  </Field>
                </div>

                {/* Batch/Expiry Section */}
                <div className="rounded-lg border border-dashed p-4 mt-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Batch & Expiry Information</span>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>Batch/Lot Number</FieldLabel>
                      <Input
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        placeholder="LOT-2024-001"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Expiration Date *</FieldLabel>
                      <Input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <Field>
                      <FieldLabel>Manufacturing Date (optional)</FieldLabel>
                      <Input
                        type="date"
                        value={manufacturingDate}
                        onChange={(e) => setManufacturingDate(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <Button onClick={handleAddItem} variant="outline" className="w-full">
                <Plus className="mr-2 size-4" />
                Add to List
              </Button>
            </FieldGroup>

            {items.length > 0 && (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const daysUntilExpiry = differenceInDays(item.expirationDate, new Date())
                      const isExpiringSoon = daysUntilExpiry <= 30
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <span className="font-medium">{item.productName}</span>
                              <Badge variant="secondary" className="ml-2">
                                {item.tier === 'wholesale' ? 'Wholesale' : 'Retail'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {item.batchNumber}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={isExpiringSoon ? 'text-orange-600' : ''}>
                                {format(item.expirationDate, 'MMM d, yyyy')}
                              </span>
                              {isExpiringSoon && (
                                <AlertTriangle className="size-4 text-orange-500" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {daysUntilExpiry} days
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(item.quantity * item.unitCost)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <Field>
              <FieldLabel>Notes (optional)</FieldLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this delivery..."
                rows={3}
              />
            </Field>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total Items: <span className="font-medium text-foreground">{totalItems}</span>
                </p>
                <p className="text-lg font-bold">
                  Total: {formatCurrency(totalCost)}
                </p>
              </div>
              <Button onClick={handleSubmit} disabled={items.length === 0}>
                <Check className="mr-2 size-4" />
                Complete Receipt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Receipts</CardTitle>
            <CardDescription>Latest stock deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receiveHistory.map((receipt) => (
                <div key={receipt.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{receipt.supplier}</span>
                    </div>
                    <Badge variant={receipt.status === 'completed' ? 'default' : 'secondary'}>
                      {receipt.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{receipt.items} items received</p>
                    <p className="font-medium text-foreground">{formatCurrency(receipt.totalCost)}</p>
                    <p className="text-xs">{format(receipt.date, 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
