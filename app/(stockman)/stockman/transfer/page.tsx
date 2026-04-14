'use client'

import { useState } from 'react'
import { StockmanShell } from '@/components/layout/stockman-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { mockProducts } from '@/lib/mock-data/products'
import { useInventory } from '@/contexts/inventory-context'
import { useAuth } from '@/contexts/auth-context'
import { ArrowRight, Package, Store, Warehouse, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function TransferPage() {
  const { inventoryLevels, transferStock } = useInventory()
  const { user } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const inventory = selectedProduct 
    ? inventoryLevels.find(inv => inv.productId === selectedProduct)
    : null
  const product = selectedProduct 
    ? mockProducts.find(p => p.id === selectedProduct)
    : null

  const handleTransferClick = () => {
    if (!selectedProduct || !inventory || quantity <= 0) {
      toast.error('Please select a product and quantity')
      return
    }

    if (quantity > inventory.retailQty) {
      toast.error('Not enough retail stock to transfer')
      return
    }

    setIsConfirmOpen(true)
  }

  const handleConfirmTransfer = () => {
    if (!selectedProduct || !inventory) return

    const userName = user?.name || 'Unknown User'
    const result = transferStock(selectedProduct, 'retail', 'shelf', quantity, userName)

    if (result.success) {
      toast.success(
        `Transfer complete: ${quantity} ${inventory.retailUnit}(s) moved to shelf`
      )
      setSelectedProduct('')
      setQuantity(1)
    } else {
      toast.error(result.error || 'Transfer failed')
    }
    setIsConfirmOpen(false)
  }

  // Products with retail stock available
  const productsWithRetailStock = mockProducts.filter(prod => {
    const inv = inventoryLevels.find(i => i.productId === prod.id)
    return inv && inv.retailQty > 0
  })

  // Products needing shelf replenishment
  const lowShelfProducts = inventoryLevels
    .filter(inv => inv.shelfQty <= inv.reorderLevel)
    .map(inv => ({
      ...inv,
      product: mockProducts.find(p => p.id === inv.productId)
    }))
    .filter(item => item.product)

  return (
    <StockmanShell
      title="Stock Transfer"
      description="Transfer stock from retail storage to store shelf"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transfer Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transfer to Shelf</CardTitle>
            <CardDescription>
              Move retail packs from storage to the store shelf
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
                    {productsWithRetailStock.map(prod => {
                      const inv = inventoryLevels.find(i => i.productId === prod.id)
                      return (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.name} ({inv?.retailQty || 0} packs available)
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>
                  Quantity (Packs)
                  {inventory && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (Available: {inventory.retailQty} {inventory.retailUnit}s)
                    </span>
                  )}
                </FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={inventory?.retailQty || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  disabled={!selectedProduct}
                />
              </Field>
            </FieldGroup>

            {inventory && product && (
              <>
                <Separator />

                {/* Transfer Preview */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-3">Transfer Preview</p>
                  
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <div className="flex size-14 items-center justify-center rounded-lg bg-background border mx-auto mb-2">
                        <Warehouse className="size-7" />
                      </div>
                      <p className="font-bold tabular-nums">{inventory.retailQty - quantity}</p>
                      <p className="text-xs text-muted-foreground">
                        Retail Stock ({inventory.retailUnit}s)
                      </p>
                      <p className="text-xs text-destructive">-{quantity}</p>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight className="size-6 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {quantity} {inventory.retailUnit}(s)
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="flex size-14 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 mx-auto mb-2">
                        <Store className="size-7 text-primary" />
                      </div>
                      <p className="font-bold tabular-nums text-primary">
                        {inventory.shelfQty + quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Shelf Stock ({inventory.retailUnit}s)
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        +{quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button 
              className="w-full" 
              onClick={handleTransferClick}
              disabled={!selectedProduct || quantity <= 0}
            >
              <ArrowRight className="size-4 mr-2" />
              Confirm Transfer
            </Button>
          </CardContent>
        </Card>

        {/* Needs Replenishment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-500" />
              Needs Replenishment
            </CardTitle>
            <CardDescription>
              Products with low shelf stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowShelfProducts.length > 0 ? (
              <div className="space-y-3">
                {lowShelfProducts.map(item => {
                  if (!item.product) return null
                  return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedProduct(item.productId)}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">
                        {item.product.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.shelfQty === 0 ? (
                        <Badge variant="destructive" className="text-xs">Out</Badge>
                      ) : (
                        <Badge className="text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                          {item.shelfQty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All shelves are well stocked</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Stock Transfer</AlertDialogTitle>
            <AlertDialogDescription>
              {inventory && (
                <>
                  You are about to transfer <strong>{quantity} {inventory.retailUnit}(s)</strong> to the store shelf.
                  <br /><br />
                  This will move stock from retail storage to the store shelf. Do you want to proceed?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTransfer}>
              Confirm Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StockmanShell>
  )
}
