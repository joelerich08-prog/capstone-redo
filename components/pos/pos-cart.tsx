'use client'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCart } from '@/contexts/cart-context'
import { formatPeso } from '@/lib/utils/currency'
import { Minus, Plus, Trash2, ShoppingCart, Receipt } from 'lucide-react'

interface POSCartProps {
  onCheckout: () => void
}

export function POSCart({ onCheckout }: POSCartProps) {
  const {
    items,
    subtotal,
    discount,
    total,
    itemCount,
    updateQuantity,
    removeItem,
    setDiscount,
    clearCart,
  } = useCart()

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="size-4" />
            Cart
            {itemCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {itemCount}
              </span>
            )}
          </CardTitle>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive h-8"
              onClick={clearCart}
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4">
          {items.length > 0 ? (
            <div className="space-y-3 pb-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || ''}-${item.productName}`}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatPeso(item.unitPrice)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.variantId, item.productName)
                      }
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.variantId, item.productName)
                      }
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <p className="text-sm font-bold tabular-nums">
                      {formatPeso(item.subtotal)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-destructive"
                      onClick={() => removeItem(item.productId, item.variantId, item.productName)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <ShoppingCart className="size-12 mb-4 opacity-50" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Add products to start a sale</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex-col gap-3 border-t pt-4">
        {/* Discount */}
        <div className="w-full flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Discount:</span>
          <Input
            type="number"
            min={0}
            max={subtotal}
            value={discount || ''}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            className="h-8 w-24 tabular-nums"
            placeholder="0.00"
            disabled={items.length === 0}
          />
        </div>

        <Separator />

        {/* Totals */}
        <div className="w-full space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPeso(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount</span>
              <span className="tabular-nums">-{formatPeso(discount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="tabular-nums text-primary">{formatPeso(total)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full h-12 text-base"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          <Receipt className="size-5 mr-2" />
          Checkout {formatPeso(total)}
        </Button>
      </CardFooter>
    </Card>
  )
}
