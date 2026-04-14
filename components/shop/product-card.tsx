"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils/currency"
import { useCart } from "@/contexts/cart-context"
import { useInventory } from "@/contexts/inventory-context"
import { mockCategories } from "@/lib/mock-data/categories"
import { Package, ShoppingCart, Check, Plus, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: {
    id: string
    name: string
    categoryId: string
    retailPrice: number
    isActive: boolean
    variants: Array<{
      id: string
      name: string
      priceAdjustment: number
    }>
  }
  viewMode: "grid" | "list"
  onQuickView: () => void
}

export function ProductCard({ product, viewMode, onQuickView }: ProductCardProps) {
  const { items } = useCart()
  const { getInventory } = useInventory()

  const variant = product.variants[0]
  const inventory = getInventory(product.id)
  const pcsPerPack = inventory?.pcsPerPack || 6
  // Pack price = retail price per piece * pieces per pack
  const packPrice = variant 
    ? (product.retailPrice + variant.priceAdjustment) * pcsPerPack 
    : product.retailPrice * pcsPerPack
  const packStock = inventory?.retailQty || 0
  const boxStock = inventory?.wholesaleQty || 0
  const inStock = packStock > 0 || boxStock > 0
  const category = mockCategories.find(c => c.id === product.categoryId)
  const inCart = items.some(item => item.productId === product.id)
  const packLabel = inventory?.retailUnit || "pack"

  if (viewMode === "list") {
    return (
      <Card 
        className={cn(
          "group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300",
          "hover:shadow-md hover:shadow-primary/5 hover:border-border hover:-translate-y-0.5",
          !inStock && "opacity-70"
        )}
        onClick={onQuickView}
      >
        <CardContent className="p-3 sm:p-4 flex gap-3 sm:gap-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/40 transition-transform duration-300 group-hover:scale-110" />
            {inCart && inStock && (
              <div className="absolute -top-1 -right-1">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm check-in">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="secondary" className="text-[10px]">Sold Out</Badge>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                {category && (
                  <Badge variant="secondary" className="text-[10px] rounded-lg shrink-0">
                    {category.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {variant?.name || "Standard"} {inStock && `| ${packStock} ${packLabel}s, ${boxStock} boxes`}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
              <div className="text-right">
                <span className="text-lg sm:text-xl font-bold text-primary tabular-nums">
                  {formatCurrency(packPrice)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">/{packLabel}</span>
              </div>
              <Button
                className="h-9 sm:h-10 rounded-xl shadow-sm min-w-[100px]"
                onClick={(e) => { e.stopPropagation(); onQuickView() }}
                disabled={!inStock}
              >
                {inCart && inStock ? (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add More</span>
                    <span className="sm:hidden">Add</span>
                  </>
                ) : inStock ? (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </>
                ) : (
                  "Out of Stock"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 hover:border-border hover:-translate-y-1",
        !inStock && "opacity-70"
      )}
      onClick={onQuickView}
    >
      <div className="aspect-square bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center relative overflow-hidden">
        <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/40 transition-transform duration-300 group-hover:scale-110" />
        
        {/* Quick View Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="sm" 
            variant="secondary" 
            className="rounded-full shadow-lg backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation()
              onQuickView()
            }}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Quick View
          </Button>
        </div>
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
          {category && (
            <Badge variant="secondary" className="text-[10px] sm:text-xs rounded-lg bg-background/90 backdrop-blur-sm shadow-sm">
              {category.name}
            </Badge>
          )}
          {inCart && inStock && (
            <Badge className="bg-primary text-primary-foreground text-[10px] sm:text-xs rounded-lg shadow-sm check-in">
              <Check className="h-3 w-3 mr-0.5" />
              <span className="hidden sm:inline">In Cart</span>
            </Badge>
          )}
        </div>
        
        {/* Low Stock Warning */}
        {inStock && packStock <= 3 && packStock > 0 && (
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <Badge variant="secondary" className="text-[10px] bg-warning/20 text-warning-foreground border-warning/30">
              Only {packStock} {packLabel}s left
            </Badge>
          </div>
        )}
        
        {!inStock && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {variant?.name || "Standard"}
        </p>
        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
          <div>
            <span className="text-base sm:text-lg font-bold text-primary tabular-nums">
              {formatCurrency(packPrice)}
            </span>
            <span className="text-xs text-muted-foreground">/{packLabel}</span>
          </div>
          <Button
            size="sm"
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm shadow-sm"
            onClick={(e) => { e.stopPropagation(); onQuickView() }}
            disabled={!inStock}
          >
            {inStock ? (
              <>
                <Plus className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </>
            ) : (
              <span className="text-xs">Sold Out</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
