'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mockProducts } from '@/lib/mock-data/products'
import { mockCategories } from '@/lib/mock-data/categories'
import { useCart } from '@/contexts/cart-context'
import { useInventory } from '@/contexts/inventory-context'
import { useSettings } from '@/contexts/settings-context'
import { formatPeso } from '@/lib/utils/currency'
import { POSCart } from './pos-cart'
import { PaymentModal } from './payment-modal'
import { Search, Package, Grid3X3, List, Box, Layers } from 'lucide-react'
import type { Product, InventoryLevel } from '@/lib/types'

type UnitType = 'pack' | 'box'

interface UnitSelectionState {
  product: Product
  inventory: InventoryLevel
  variant?: Product['variants'][0]
}

export function POSTerminal() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [variantProduct, setVariantProduct] = useState<Product | null>(null)
  const [unitSelection, setUnitSelection] = useState<UnitSelectionState | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const { addItem, total, itemCount } = useCart()
  const { getInventory } = useInventory()
  const { settings } = useSettings()

  const filteredProducts = mockProducts.filter(product => {
    if (!product.isActive) return false
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    const inventory = getInventory(product.id)
    // Show products if they have stock in ANY tier (wholesale, retail, or shelf)
    const hasStock = inventory && (inventory.wholesaleQty > 0 || inventory.retailQty > 0 || inventory.shelfQty > 0)
    return matchesSearch && matchesCategory && hasStock
  })

  const handleProductClick = (product: Product) => {
    const inventory = getInventory(product.id)
    if (!inventory) return

    if (product.variants.length > 0) {
      setVariantProduct(product)
    } else {
      // Show unit selection dialog
      setUnitSelection({ product, inventory })
    }
  }

  const handleVariantSelect = (variant: Product['variants'][0]) => {
    if (!variantProduct) return
    const inventory = getInventory(variantProduct.id)
    if (!inventory) return

    // Show unit selection with variant
    setUnitSelection({ product: variantProduct, inventory, variant })
    setVariantProduct(null)
  }

  const handleUnitSelect = (unitType: UnitType) => {
    if (!unitSelection) return

    const { product, inventory, variant } = unitSelection
    const basePrice = variant 
      ? product.retailPrice + variant.priceAdjustment 
      : product.retailPrice

    let unitPrice: number
    let unitLabel: string

    if (unitType === 'pack') {
      unitPrice = basePrice * inventory.pcsPerPack
      unitLabel = inventory.retailUnit
    } else {
      unitPrice = basePrice * inventory.pcsPerPack * inventory.packsPerBox
      unitLabel = inventory.wholesaleUnit
    }

    addItem({
      productId: product.id,
      variantId: variant?.id,
      productName: `${product.name} (${unitLabel})`,
      variantName: variant?.name,
      quantity: 1,
      unitPrice: unitPrice,
      unitType: unitType,  // Track whether sold as pack or box
      unitLabel: unitLabel,
    })

    setUnitSelection(null)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* Product Selection */}
      <Card className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Products</CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="size-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="size-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="size-8"
                onClick={() => setViewMode('list')}
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder={settings.pos.quickAddMode ? "Search or scan barcode..." : "Search products..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Categories */}
          <div className="overflow-x-auto mt-2 -mx-6 px-6">
            <div className="flex gap-2 pb-2 w-max">
              <Button
                variant={selectedCategory === 'all' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {mockCategories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 min-h-96">
          <ScrollArea className="h-full px-4 pb-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map(product => {
                  const inventory = getInventory(product.id)
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex flex-col items-center p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                    >
                      {settings.pos.showProductImages && (
                        <div className="flex size-12 items-center justify-center rounded-lg bg-muted mb-2">
                          <Package className="size-6 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm font-medium text-center line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-lg font-bold tabular-nums text-primary mt-1">
                        {formatPeso(product.retailPrice)}
                      </p>
                      {product.variants.length > 0 && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {product.variants.length} variants
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Stock: {inventory ? (inventory.wholesaleQty + inventory.retailQty + inventory.shelfQty) : 0}
                      </p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map(product => {
                  const inventory = getInventory(product.id)
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {settings.pos.showProductImages && (
                          <div className="flex size-10 items-center justify-center rounded bg-muted">
                            <Package className="size-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.sku} | Stock: {inventory ? (inventory.wholesaleQty + inventory.retailQty + inventory.shelfQty) : 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold tabular-nums">
                          {formatPeso(product.retailPrice)}
                        </p>
                        {product.variants.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {product.variants.length} variants
                          </Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="size-12 mx-auto mb-4 opacity-50" />
                <p>No products found</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Cart */}
      <div className="w-80 lg:w-96 shrink-0">
        <POSCart onCheckout={() => setIsPaymentOpen(true)} />
      </div>

      {/* Variant Selection Dialog */}
      <Dialog open={!!variantProduct} onOpenChange={() => setVariantProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{variantProduct?.name}</DialogTitle>
            <DialogDescription>
              Select a variant to add to cart
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {variantProduct?.variants.map(variant => {
              const price = variantProduct.retailPrice + variant.priceAdjustment
              return (
                <Button
                  key={variant.id}
                  variant="outline"
                  className="h-auto py-4 flex-col"
                  onClick={() => handleVariantSelect(variant)}
                >
                  <span className="font-medium">{variant.name}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatPeso(price)}
                  </span>
                </Button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unit Selection Dialog */}
      <Dialog open={!!unitSelection} onOpenChange={() => setUnitSelection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {unitSelection?.product.name}
              {unitSelection?.variant && ` - ${unitSelection.variant.name}`}
            </DialogTitle>
            <DialogDescription>
              Select how you want to sell this item
            </DialogDescription>
          </DialogHeader>
          {unitSelection && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Per Pack */}
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                disabled={unitSelection.inventory.retailQty <= 0}
                title={unitSelection.inventory.retailQty <= 0 ? 'No retail stock available' : ''}
                onClick={() => handleUnitSelect('pack')}
              >
                <Layers className="size-6" />
                <span className="font-medium capitalize">{unitSelection.inventory.retailUnit}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatPeso(
                    (unitSelection.variant
                      ? unitSelection.product.retailPrice + unitSelection.variant.priceAdjustment
                      : unitSelection.product.retailPrice) * unitSelection.inventory.pcsPerPack
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {unitSelection.inventory.pcsPerPack} pcs
                </span>
                {unitSelection.inventory.retailQty <= 0 && (
                  <span className="text-xs text-destructive mt-1">Out of stock</span>
                )}
              </Button>

              {/* Per Box */}
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                disabled={unitSelection.inventory.wholesaleQty <= 0}
                title={unitSelection.inventory.wholesaleQty <= 0 ? 'No wholesale stock available' : ''}
                onClick={() => handleUnitSelect('box')}
              >
                <Box className="size-6" />
                <span className="font-medium capitalize">{unitSelection.inventory.wholesaleUnit}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatPeso(
                    (unitSelection.variant
                      ? unitSelection.product.retailPrice + unitSelection.variant.priceAdjustment
                      : unitSelection.product.retailPrice) * unitSelection.inventory.pcsPerPack * unitSelection.inventory.packsPerBox
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {unitSelection.inventory.pcsPerPack * unitSelection.inventory.packsPerBox} pcs
                </span>
                {unitSelection.inventory.wholesaleQty <= 0 && (
                  <span className="text-xs text-destructive mt-1">Out of stock</span>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  )
}
