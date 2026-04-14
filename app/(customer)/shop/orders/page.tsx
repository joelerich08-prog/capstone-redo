"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useOrders } from "@/contexts/order-context"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/lib/utils/currency"
import { format } from "date-fns"
import { Package, ChevronRight, Clock, CheckCircle2, XCircle, Truck, ShoppingBag, Search, AlertCircle, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Order } from "@/lib/types"

const statusConfig: Record<string, { 
  label: string
  color: string
  bgColor: string
  icon: typeof Clock
}> = {
  pending: { 
    label: "Pending", 
    color: "text-amber-600",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    icon: Clock
  },
  preparing: { 
    label: "Preparing", 
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    icon: Package
  },
  ready: { 
    label: "Ready for Pickup", 
    color: "text-purple-600",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    icon: Truck
  },
  completed: { 
    label: "Completed", 
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2
  },
  cancelled: { 
    label: "Cancelled", 
    color: "text-red-600",
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: XCircle
  },
}

function CancelConfirmDialog({
  order,
  open,
  onOpenChange,
  onConfirm,
  isCancelling,
}: {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isCancelling: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
              <Ban className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-lg">Cancel Order</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            Are you sure you want to cancel order{" "}
            <span className="font-mono font-semibold text-foreground">
              {order.orderNo || order.id.slice(0, 8).toUpperCase()}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Order summary */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span className="font-medium">
              {order.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tabular-nums">{formatCurrency(order.total)}</span>
          </div>
          <Separator className="my-1" />
          <p className="text-xs text-muted-foreground">
            {order.items.slice(0, 2).map(i => i.productName).join(", ")}
            {order.items.length > 2 && ` and ${order.items.length - 2} more`}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isCancelling}
          >
            Keep Order
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl"
            onClick={onConfirm}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Cancelling...
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Yes, Cancel Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: (order: Order) => void }) {
  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon
  const canCancel = order.status === 'pending'

  return (
    <Card
      className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-border"
    >
      <CardContent className="p-4 sm:p-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              status.bgColor
            )}>
              <StatusIcon className={cn("h-5 w-5", status.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-medium">
                  {order.orderNo || order.id.slice(0, 8).toUpperCase()}
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-xs rounded-lg", status.bgColor, status.color)}
                >
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>

          {/* Total - Mobile */}
          <div className="sm:hidden flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{order.items.length} items</span>
            <span className="text-lg font-bold tabular-nums">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex -space-x-2">
              {order.items.slice(0, 3).map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2 border-background"
                >
                  <Package className="h-5 w-5 text-muted-foreground/50" />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center border-2 border-background">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{order.items.length - 3}
                  </span>
                </div>
              )}
            </div>
            <div className="hidden sm:block flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {order.items.slice(0, 2).map(i => i.productName).join(", ")}
                {order.items.length > 2 && ` and ${order.items.length - 2} more`}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.items.reduce((acc, i) => acc + i.quantity, 0)} items total
              </p>
            </div>
          </div>

          {/* Total and Actions - Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold tabular-nums">{formatCurrency(order.total)}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                onClick={() => onCancel(order)}
              >
                <Ban className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Actions - Mobile */}
          <div className="sm:hidden flex items-center gap-2">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 text-xs h-8 px-2"
                onClick={() => onCancel(order)}
              >
                <Ban className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function GuestOrderLookup() {
  const { lookupOrder, cancelOrder } = useOrders()
  const [orderNo, setOrderNo] = useState("")
  const [phone, setPhone] = useState("")
  const [foundOrder, setFoundOrder] = useState<Order | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!orderNo.trim() || !phone.trim()) {
      setError("Please enter both order number and phone number")
      return
    }

    setIsSearching(true)

    // Small delay for UX feedback
    setTimeout(() => {
      const order = lookupOrder(orderNo, phone)
      setFoundOrder(order)
      setIsSearching(false)

      if (order) {
        setDialogOpen(true)
      } else {
        setError("No order found with that order number and phone number. Please check your details and try again.")
      }
    }, 300)
  }

  const handleGuestCancelConfirm = () => {
    if (!foundOrder) return
    setIsCancelling(true)

    setTimeout(() => {
      const result = cancelOrder(foundOrder.id)
      setIsCancelling(false)
      setCancelDialogOpen(false)

      if (result.success) {
        // Refresh the found order so the status updates in the dialog
        const updated = lookupOrder(orderNo, phone)
        setFoundOrder(updated)
        toast.success("Order cancelled successfully.")
      } else {
        toast.error(result.error || "Failed to cancel order.")
      }
    }, 600)
  }

  const status = foundOrder ? (statusConfig[foundOrder.status] || statusConfig.pending) : null
  const StatusIcon = status?.icon || Clock

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Track Your Order</CardTitle>
            <CardDescription className="text-pretty">
              Enter your order number and phone number to view your order status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNo" className="text-sm font-medium">
                  Order Number
                </Label>
                <Input
                  id="orderNo"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="ORD-123456"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09171234567"
                  className="h-11 rounded-xl"
                />
              </div>
              
              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <Button type="submit" className="w-full h-11 rounded-xl" disabled={isSearching}>
                {isSearching ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Order
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Want to see all your orders?
              </p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      {foundOrder && (
        <CancelConfirmDialog
          order={foundOrder}
          open={cancelDialogOpen}
          onOpenChange={(open) => { if (!open) setCancelDialogOpen(false) }}
          onConfirm={handleGuestCancelConfirm}
          isCancelling={isCancelling}
        />
      )}

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {foundOrder && status && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    status.bgColor
                  )}>
                    <StatusIcon className={cn("h-6 w-6", status.color)} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      Order {foundOrder.orderNo || foundOrder.id.slice(0, 8).toUpperCase()}
                    </DialogTitle>
                    <DialogDescription>
                      {format(new Date(foundOrder.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-sm rounded-lg px-3 py-1", status.bgColor, status.color)}
                  >
                    {status.label}
                  </Badge>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {foundOrder.items.map((item, index) => (
                      <div 
                        key={`${item.productId}-${index}`}
                        className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl"
                      >
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.unitPrice)} x {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold tabular-nums">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items ({foundOrder.items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                    <span className="tabular-nums">{formatCurrency(foundOrder.total)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold tabular-nums">{formatCurrency(foundOrder.total)}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-muted/20 rounded-xl space-y-2">
                  <h4 className="font-semibold text-sm">Customer Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{foundOrder.customerName}</span>
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{foundOrder.customerPhone}</span>
                  </div>
                  {foundOrder.notes && (
                    <div className="pt-2 border-t border-border/50 mt-2">
                      <span className="text-sm text-muted-foreground">Notes: </span>
                      <span className="text-sm">{foundOrder.notes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {foundOrder.status === 'pending' && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => setDialogOpen(false)}
                    >
                      Close
                    </Button>
                    <Button asChild className="flex-1 rounded-xl">
                      <Link href="/shop">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Shop More
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserOrders() {
  const { user } = useAuth()
  const { getOrdersForUser, cancelOrder } = useOrders()
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const userOrders = user ? getOrdersForUser(user.id) : []

  const handleCancelConfirm = () => {
    if (!orderToCancel) return
    setIsCancelling(true)

    // Small delay for UX feedback
    setTimeout(() => {
      const result = cancelOrder(orderToCancel.id)
      setIsCancelling(false)
      setOrderToCancel(null)

      if (result.success) {
        toast.success("Order cancelled successfully.")
      } else {
        toast.error(result.error || "Failed to cancel order.")
      }
    }, 600)
  }

  if (userOrders.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-md">
          <div className="h-24 w-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            When you place orders, they will appear here. Start shopping to see your order history!
          </p>
          <Button asChild className="mt-8 h-12 px-8 rounded-xl">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground mt-1">
              {userOrders.length} {userOrders.length === 1 ? "order" : "orders"} placed
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl hidden sm:flex">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {userOrders.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={setOrderToCancel} />
          ))}
        </div>

        {/* Mobile Continue Shopping */}
        <div className="sm:hidden mt-6">
          <Button asChild variant="outline" className="w-full h-12 rounded-xl">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {orderToCancel && (
        <CancelConfirmDialog
          order={orderToCancel}
          open={!!orderToCancel}
          onOpenChange={(open) => { if (!open) setOrderToCancel(null) }}
          onConfirm={handleCancelConfirm}
          isCancelling={isCancelling}
        />
      )}
    </div>
  )
}

export default function CustomerOrdersPage() {
  const { user } = useAuth()
  
  // If user is logged in, show their orders
  // If not logged in, show order lookup form
  if (user) {
    return <UserOrders />
  }
  
  return <GuestOrderLookup />
}
