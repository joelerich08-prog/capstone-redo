"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { formatCurrency } from "@/lib/utils/currency"
import { 
  ShoppingCart, 
  Package, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ShoppingBag,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MiniCartProps {
  className?: string
}

export function MiniCart({ className }: MiniCartProps) {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [prevCount, setPrevCount] = useState(itemCount)

  // Trigger animation when items are added
  useEffect(() => {
    if (itemCount > prevCount) {
      setJustAdded(true)
      setIsOpen(true)
      const timer = setTimeout(() => setJustAdded(false), 500)
      return () => clearTimeout(timer)
    }
    setPrevCount(itemCount)
  }, [itemCount, prevCount])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative h-10 w-10 rounded-xl hover:bg-accent/50",
            justAdded && "cart-pop",
            className
          )}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className={cn(
              "absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground shadow-sm",
              justAdded && "check-in"
            )}>
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b bg-accent/30">
          <SheetTitle className="flex items-center justify-between">
            <span>Your Cart</span>
            {itemCount > 0 && (
              <Badge variant="secondary" className="rounded-full font-normal">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review and manage items in your shopping cart
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="h-20 w-20 rounded-2xl bg-accent/50 flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-lg">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              Start shopping to add items to your cart
            </p>
            <Button 
              className="mt-6 rounded-xl" 
              onClick={() => setIsOpen(false)}
              asChild
            >
              <Link href="/shop">
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto px-4 py-4">
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.variantId}-${item.productName}`}
                    className="group flex gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200"
                  >
                    {/* Product Icon */}
                    <div className="h-14 w-14 rounded-lg bg-accent/50 flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground/50" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.variantName || "Standard"} {item.unitType === "box" && <span className="text-primary font-medium">• Wholesale</span>}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
                          onClick={() => removeItem(item.productId, item.variantId, item.productName)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-0.5 bg-accent/50 rounded-lg p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId, item.productName)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-sm font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId, item.productName)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <span className="font-semibold text-sm tabular-nums">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-accent/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold tabular-nums">{formatCurrency(total)}</span>
              </div>
              <div className="grid gap-2">
                <Button 
                  className="w-full h-11 rounded-xl font-semibold shadow-sm" 
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/shop/checkout">
                    Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-10 rounded-xl" 
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/shop/cart">
                    View Full Cart
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
