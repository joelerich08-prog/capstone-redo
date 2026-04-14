"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/utils/currency"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-md">
          <div className="h-24 w-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Looks like you haven&apos;t added any items to your cart yet. Start shopping to fill it up!
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearCart}
            className="text-muted-foreground hover:text-destructive hidden sm:flex"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <Card 
                key={`${item.productId}-${item.variantId}`}
                className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg truncate pr-4">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {item.variantName || "Standard"} 
                            {item.unitType === "box" && <span className="ml-1 text-primary font-medium">• Wholesale</span>}
                            {item.unitLabel && <span className="ml-1">• per {item.unitLabel}</span>}
                          </p>
                          <p className="text-sm font-medium text-primary mt-1 sm:hidden tabular-nums">
                            {formatCurrency(item.unitPrice)} / {item.unitLabel || "item"}
                          </p>
                        </div>
                        <p className="hidden sm:block text-lg font-semibold tabular-nums whitespace-nowrap text-muted-foreground">
                          {formatCurrency(item.unitPrice)} / {item.unitLabel || "item"}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId, item.productName)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-10 text-center font-medium tabular-nums text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId, item.productName)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <p className="font-bold tabular-nums text-base sm:text-lg">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.productId, item.variantId, item.productName)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Mobile Clear Cart */}
            <div className="sm:hidden">
              <Button 
                variant="outline" 
                className="w-full rounded-xl text-muted-foreground"
                onClick={clearCart}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </div>
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
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                    <span className="font-medium tabular-nums">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-success">Free</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold tabular-nums">{formatCurrency(total)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button className="w-full h-12 rounded-xl text-base font-semibold shadow-sm" size="lg" asChild>
                  <Link href="/shop/checkout">
                    Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full h-11 rounded-xl" asChild>
                  <Link href="/shop">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
