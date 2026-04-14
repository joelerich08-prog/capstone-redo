'use client'

import { useState } from 'react'
import { StockmanShell } from '@/components/layout/stockman-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Product } from '@/lib/types'
import { mockProducts } from '@/lib/mock-data/products'
import { mockCategories, getCategoryName } from '@/lib/mock-data/categories'
import { useInventory } from '@/contexts/inventory-context'
import { formatPeso } from '@/lib/utils/currency'
import { Search, Package, Eye, Boxes, PackageOpen } from 'lucide-react'
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/shared/table-pagination'

export default function StockmanProductsPage() {
  const { inventoryLevels } = useInventory()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  const pagination = usePagination(filteredProducts, { itemsPerPage: 10 })

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsViewOpen(true)
  }

  const getProductInventory = (productId: string) => {
    return inventoryLevels.find(inv => inv.productId === productId)
  }

  return (
    <StockmanShell
      title="Products"
      description="View product catalog and stock information"
    >
      <Card>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Wholesale</TableHead>
                <TableHead className="text-right">Retail</TableHead>
                <TableHead className="text-right">Wholesale Stock</TableHead>
                <TableHead className="text-right">Retail Stock</TableHead>
                <TableHead className="text-right">Shelf Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.map(product => {
                const inventory = getProductInventory(product.id)

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {product.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>
                      {product.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.variants.slice(0, 2).map(v => (
                            <Badge key={v.id} variant="outline" className="text-xs">
                              {v.name}
                            </Badge>
                          ))}
                          {product.variants.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.variants.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPeso(product.costPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPeso(product.wholesalePrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatPeso(product.retailPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inventory?.wholesaleQty ?? 0}
                      <span className="text-xs text-muted-foreground ml-1">
                        {inventory?.wholesaleUnit ?? ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inventory?.retailQty ?? 0}
                      <span className="text-xs text-muted-foreground ml-1">
                        {inventory?.retailUnit ?? ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inventory?.shelfQty ?? 0}
                      <span className="text-xs text-muted-foreground ml-1">
                        {inventory?.shelfUnit ?? ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your criteria.
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="size-5" />
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU</span>
                  <p className="font-mono font-medium">{selectedProduct.sku}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium">{getCategoryName(selectedProduct.categoryId)}</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <p className="font-medium">{selectedProduct.description}</p>
                </div>
              )}

              <Separator />

              <div>
                <span className="text-sm text-muted-foreground">Pricing</span>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="font-bold tabular-nums">{formatPeso(selectedProduct.costPrice)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Wholesale</p>
                    <p className="font-bold tabular-nums">{formatPeso(selectedProduct.wholesalePrice)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Retail</p>
                    <p className="font-bold tabular-nums">{formatPeso(selectedProduct.retailPrice)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {(() => {
                const inventory = getProductInventory(selectedProduct.id)
                if (!inventory) return null
                return (
                  <div>
                    <span className="text-sm text-muted-foreground">Stock Levels</span>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <Boxes className="size-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-lg font-bold tabular-nums">{inventory.wholesaleQty}</p>
                        <p className="text-xs text-muted-foreground">Wholesale ({inventory.wholesaleUnit})</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <Package className="size-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-lg font-bold tabular-nums">{inventory.retailQty}</p>
                        <p className="text-xs text-muted-foreground">Retail ({inventory.retailUnit})</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <PackageOpen className="size-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-lg font-bold tabular-nums">{inventory.shelfQty}</p>
                        <p className="text-xs text-muted-foreground">Shelf ({inventory.shelfUnit})</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground text-center">
                      Packaging: {inventory.packsPerBox} packs/box
                    </div>
                  </div>
                )
              })()}

              {selectedProduct.variants.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Variants</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProduct.variants.map(v => (
                        <Badge key={v.id} variant="outline">
                          {v.name}
                          {v.priceAdjustment !== 0 && (
                            <span className="ml-1 text-muted-foreground">
                              ({v.priceAdjustment > 0 ? '+' : ''}{formatPeso(v.priceAdjustment)})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StockmanShell>
  )
}
