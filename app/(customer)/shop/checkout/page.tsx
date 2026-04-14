"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/order-context"
import { useInventory } from "@/contexts/inventory-context"
import { formatCurrency } from "@/lib/utils/currency"
import { isValidPhoneNumber, isValidName } from "@/lib/utils/validation"
import type { InventoryTier } from "@/lib/types"
import { ArrowLeft, CreditCard, Banknote, Smartphone, ShoppingBag, CheckCircle, Loader2, Package, ArrowRight, Sparkles, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type PaymentMethod = "cash" | "gcash" | "maya"

const paymentMethods = [
  {
    id: "cash" as const,
    name: "Cash on Pickup",
    description: "Pay when you pick up your order",
    icon: Banknote,
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    selectedColor: "border-emerald-500 bg-emerald-500/10",
  },
  {
    id: "gcash" as const,
    name: "GCash",
    description: "Pay via GCash e-wallet",
    icon: Smartphone,
    color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    selectedColor: "border-blue-500 bg-blue-500/10",
  },
  {
    id: "maya" as const,
    name: "Maya",
    description: "Pay via Maya e-wallet",
    icon: CreditCard,
    color: "text-green-600 bg-green-500/10 border-green-500/20",
    selectedColor: "border-green-500 bg-green-500/10",
  },
]

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const { addOrder, validateOrder } = useOrders()
  const { adjustStock, getInventory } = useInventory()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [orderNo, setOrderNo] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    email: user?.email || "",
    notes: "",
  })

  if (items.length === 0 && !isComplete) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-md">
          <div className="h-24 w-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Add some items to your cart before checking out
          </p>
          <Button asChild className="mt-8 h-12 px-8 rounded-xl">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-md">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-success/10 flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-success" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Order Placed!</h1>
          {orderNo && (
            <div className="mt-4 px-4 py-2 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-mono font-bold text-lg">{orderNo}</p>
            </div>
          )}
          <p className="mt-4 text-muted-foreground text-pretty">
            Thank you for your order. We&apos;ll notify you when it&apos;s ready for pickup.
          </p>
          {!user && (
            <p className="mt-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
              Save your order number to track your order status
            </p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <Button asChild className="flex-1 h-12 rounded-xl">
              <Link href="/shop/orders">View Orders</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-12 rounded-xl">
              <Link href="/shop">Shop More</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsProcessing(true)
    
    // Validate name using shared utility
    const nameValidation = isValidName(formData.name)
    if (!nameValidation.valid) {
      setFormError(nameValidation.error || "Invalid name")
      setIsProcessing(false)
      return
    }
    
    // Validate phone using shared utility
    if (!isValidPhoneNumber(formData.phone)) {
      setFormError("Please enter a valid Philippine phone number (e.g., 09171234567)")
      setIsProcessing(false)
      return
    }

    // Verify product availability and prices before processing payment
    // This prevents selling items that no longer exist or price mismatches
    for (const item of items) {
      const inventory = getInventory(item.productId)
      if (!inventory) {
        setFormError(`Product "${item.productName}" is no longer available`)
        setIsProcessing(false)
        return
      }

      // Check that the tier has enough stock
      const tier = item.unitType === 'box' ? inventory.wholesaleQty 
                 : item.unitType === 'pack' ? inventory.retailQty 
                 : inventory.shelfQty
      
      if (tier < item.quantity) {
        setFormError(`Insufficient stock for "${item.productName}". Only ${tier} available.`)
        setIsProcessing(false)
        return
      }
    }

    // Prepare order data
    const orderData = {
      source: 'website' as const,
      userId: user?.id, // Will be undefined for guests
      customerName: formData.name,
      customerPhone: formData.phone,
      items: items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      total,
      paymentMethod,
      status: 'pending' as const,
      notes: formData.notes || undefined,
    }

    // Validate order before submitting
    const validation = validateOrder(orderData)
    if (!validation.valid) {
      setFormError(validation.error || "Invalid order data")
      setIsProcessing(false)
      return
    }
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Deduct inventory FIRST before creating order
    const customerName = user?.name || formData.name
    const deductedItems: Array<{productId: string; tier: InventoryTier; quantity: number}> = []
    let inventoryError = false
    let errorMessage = ""
    
    // Try to deduct all items
    for (const item of items) {
      // Determine which tier to deduct from based on unit type
      // Default to 'retail' for standard sales (packs), 'wholesale' for boxes
      const tier: InventoryTier = item.unitType === 'box' ? 'wholesale' 
                                : item.unitType === 'piece' ? 'shelf'
                                : 'retail'
      
      const result = adjustStock(
        item.productId,
        tier,
        -item.quantity,
        'Sale',
        `Customer order - Sold ${item.quantity} ${item.unitLabel || 'unit(s)'}`,
        customerName
      )
      
      if (!result.success) {
        inventoryError = true
        errorMessage = result.error || "Failed to update inventory"
        break
      }
      
      deductedItems.push({ productId: item.productId, tier, quantity: item.quantity })
    }

    // If any inventory deduction failed, rollback previous deductions
    if (inventoryError) {
      for (const deducted of deductedItems) {
        adjustStock(
          deducted.productId,
          deducted.tier,
          deducted.quantity, // Add back the quantity
          'Rollback',
          `Rollback for failed order`,
          customerName
        )
      }
      setIsProcessing(false)
      setFormError(`Inventory error: ${errorMessage}. Please try again.`)
      return
    }
    
    // Create the order AFTER inventory is deducted
    const newOrder = addOrder(orderData)
    
    if (!newOrder) {
      // If order creation failed, rollback inventory changes
      for (const deducted of deductedItems) {
        adjustStock(
          deducted.productId,
          deducted.tier,
          deducted.quantity,
          'Rollback',
          `Rollback for failed order creation`,
          customerName
        )
      }
      setIsProcessing(false)
      setFormError("Failed to place order. Please try again.")
      return
    }
    
    clearCart()
    setOrderNo(newOrder.orderNo)
    setIsComplete(true)
    toast.success("Order placed successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-xl hover:bg-muted/50">
          <Link href="/shop/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-1">Complete your order</p>
        </div>

        {/* Form Error */}
        {formError && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                  <CardDescription>
                    We&apos;ll use this to contact you about your order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Juan Dela Cruz"
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="09171234567"
                        className="h-11 rounded-xl"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Format: 09XXXXXXXXX or +639XXXXXXXXX</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="juan@example.com"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Order Notes <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special instructions for your order..."
                      rows={3}
                      className="rounded-xl resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                  <CardDescription>
                    Select how you&apos;d like to pay
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    className="grid gap-3 sm:grid-cols-3"
                  >
                    {paymentMethods.map((method) => {
                      const isSelected = paymentMethod === method.id
                      return (
                        <div key={method.id}>
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={method.id}
                            className={cn(
                              "flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:bg-muted/30",
                              isSelected 
                                ? method.selectedColor + " ring-2 ring-offset-2 ring-offset-background"
                                : "border-border/50"
                            )}
                          >
                            <div className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                              method.color
                            )}>
                              <method.icon className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-sm">{method.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{method.description}</p>
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                  <CardDescription>{items.length} {items.length === 1 ? "item" : "items"} in your order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div 
                        key={`${item.productId}-${item.variantId}`} 
                        className={cn(
                          "flex items-center gap-4",
                          index !== items.length - 1 && "pb-4 border-b border-border/50"
                        )}
                      >
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base truncate">{item.productName}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {item.variantName || "Standard"} x {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold text-sm sm:text-base tabular-nums">{formatCurrency(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium tabular-nums">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="font-medium tabular-nums">{formatCurrency(0)}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold tabular-nums">{formatCurrency(total)}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-sm"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
