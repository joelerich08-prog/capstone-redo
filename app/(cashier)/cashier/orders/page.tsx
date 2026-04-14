'use client'

import { useState, useEffect } from 'react'
import { CashierShell } from '@/components/layout/cashier-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useOrders } from '@/contexts/order-context'
import { mockProducts } from '@/lib/mock-data/products'
import { formatPeso } from '@/lib/utils/currency'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Facebook,
  MessageSquare,
  Globe,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Package,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Order, OrderStatus } from '@/lib/types'
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/shared/table-pagination'

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', icon: Clock },
  preparing: { label: 'Preparing', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: ChefHat },
  ready: { label: 'Ready', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', icon: Package },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: XCircle },
}

const sourceIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  sms: MessageSquare,
  website: Globe,
}

interface NewOrderItem {
  productId: string
  productName: string
  variantId?: string
  variantName?: string
  quantity: number
  unitPrice: number
}

export default function CashierOrdersPage() {
  const { orders, addOrder: addOrderToContext, updateOrderStatus: updateOrderStatusContext } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // New order form state
  const [newOrderSource, setNewOrderSource] = useState<'facebook' | 'sms'>('facebook')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<NewOrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab)

  const pagination = usePagination(filteredOrders, { itemsPerPage: 10 })

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  const resetNewOrderForm = () => {
    setCustomerName('')
    setCustomerPhone('')
    setNotes('')
    setOrderItems([])
    setNewOrderSource('facebook')
    setSelectedProduct('')
    setSelectedVariant('')
    setItemQuantity(1)
  }

  const handleAddItem = () => {
    const product = mockProducts.find(p => p.id === selectedProduct)
    if (!product) return

    const variant = product.variants.find(v => v.id === selectedVariant)
    const unitPrice = product.retailPrice + (variant?.priceAdjustment || 0)

    const newItem: NewOrderItem = {
      productId: product.id,
      productName: product.name,
      variantId: variant?.id,
      variantName: variant?.name,
      quantity: itemQuantity,
      unitPrice,
    }

    setOrderItems([...orderItems, newItem])
    setSelectedProduct('')
    setSelectedVariant('')
    setItemQuantity(1)
  }

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  }

  const handleCreateOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || orderItems.length === 0) {
      toast.error('Please fill in all required fields and add at least one item')
      return
    }

    addOrderToContext({
      source: newOrderSource,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: orderItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      total: calculateTotal(),
      status: 'preparing',
      notes: notes.trim() || undefined,
    })

    setIsAddOrderOpen(false)
    resetNewOrderForm()
    toast.success('Order created successfully')
  }

  const selectedProductData = mockProducts.find(p => p.id === selectedProduct)

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatusContext(orderId, newStatus)
    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
    toast.success(`Order status updated to ${statusConfig[newStatus].label}`)
  }

  return (
    <CashierShell
      title="Orders"
      description="Manage online orders from all channels"
    >
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="text-xs">{orderCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {orderCounts.pending > 0 && (
                <Badge variant="destructive" className="text-xs">{orderCounts.pending}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing" className="gap-2">
              Preparing
              <Badge variant="secondary" className="text-xs">{orderCounts.preparing}</Badge>
            </TabsTrigger>
  <TabsTrigger value="ready" className="gap-2">
    Ready
    <Badge variant="secondary" className="text-xs">{orderCounts.ready}</Badge>
  </TabsTrigger>
  <TabsTrigger value="completed" className="gap-2">
    Completed
    <Badge variant="secondary" className="text-xs">{orderCounts.completed}</Badge>
  </TabsTrigger>
  <TabsTrigger value="cancelled" className="gap-2">
    Cancelled
    <Badge variant="secondary" className="text-xs">{orderCounts.cancelled}</Badge>
  </TabsTrigger>
  </TabsList>
        </Tabs>
        <Button onClick={() => setIsAddOrderOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Order
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.map(order => {
                const status = statusConfig[order.status]
                const SourceIcon = sourceIcons[order.source] || Globe
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNo}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <SourceIcon className="size-4 text-muted-foreground" />
                        <span className="capitalize text-sm">{order.source}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatPeso(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${status.color}`}>
                        <status.icon className="size-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {isClient ? formatDistanceToNow(order.createdAt, { addSuffix: true }) : '...'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No orders found.
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

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedOrder.orderNo}
                  <Badge className={`text-xs ${statusConfig[selectedOrder.status].color}`}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {format(selectedOrder.createdAt, 'PPP p')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                  {selectedOrder.notes && (
                    <p className="text-sm mt-2 italic">{`"${selectedOrder.notes}"`}</p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.productName}
                          {item.variantName && ` (${item.variantName})`}
                        </span>
                        <span className="tabular-nums">{formatPeso(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="tabular-nums">{formatPeso(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <div className="flex gap-2">
                    {selectedOrder.status === 'pending' && (
                      <Button
                        className="flex-1"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                      >
                        <ChefHat className="size-4 mr-2" />
                        Start Preparing
                      </Button>
                    )}
                    {selectedOrder.status === 'preparing' && (
                      <Button
                        className="flex-1"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                      >
                        <Package className="size-4 mr-2" />
                        Mark Ready
                      </Button>
                    )}
                    {selectedOrder.status === 'ready' && (
                      <Button
                        className="flex-1"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                      >
                        <CheckCircle2 className="size-4 mr-2" />
                        Complete
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="text-destructive"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    >
                      <XCircle className="size-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Order Dialog */}
      <Dialog open={isAddOrderOpen} onOpenChange={(open) => {
        setIsAddOrderOpen(open)
        if (!open) resetNewOrderForm()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Manual Order</DialogTitle>
            <DialogDescription>
              Create a new order for Facebook or SMS customers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Order Source */}
            <div className="space-y-2">
              <Label>Order Source</Label>
              <Select value={newOrderSource} onValueChange={(value: 'facebook' | 'sms') => setNewOrderSource(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">
                    <div className="flex items-center gap-2">
                      <Facebook className="size-4" />
                      Facebook
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  placeholder="+63 9XX XXX XXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Add Items */}
            <div className="space-y-3">
              <Label>Add Items</Label>
              <div className="flex gap-2">
                <Select value={selectedProduct} onValueChange={(value) => {
                  setSelectedProduct(value)
                  setSelectedVariant('')
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.filter(p => p.isActive).map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {formatPeso(product.retailPrice)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedProductData && selectedProductData.variants.length > 0 && (
                  <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProductData.variants.map(variant => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name}
                          {variant.priceAdjustment > 0 && ` (+${formatPeso(variant.priceAdjustment)})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Input
                  type="number"
                  min={1}
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20"
                />

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddItem}
                  disabled={!selectedProduct}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {/* Order Items List */}
            {orderItems.length > 0 && (
              <div className="space-y-2">
                <Label>Order Items</Label>
                <div className="border rounded-lg divide-y">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium text-sm">
                          {item.quantity}x {item.productName}
                          {item.variantName && ` (${item.variantName})`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPeso(item.unitPrice)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium tabular-nums">
                          {formatPeso(item.unitPrice * item.quantity)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 bg-muted/50 font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPeso(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Special instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOrderOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrder}
              disabled={!customerName.trim() || !customerPhone.trim() || orderItems.length === 0}
            >
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CashierShell>
  )
}
