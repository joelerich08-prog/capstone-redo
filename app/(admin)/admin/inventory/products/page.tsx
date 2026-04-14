'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { DashboardShell } from '@/components/layout/dashboard-shell'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import type { Product, ProductVariant } from '@/lib/types'
import { mockProducts, getProductInventory } from '@/lib/mock-data/products'
import { mockCategories, getCategoryName } from '@/lib/mock-data/categories'
import { formatPeso } from '@/lib/utils/currency'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/shared/table-pagination'

export default function ProductsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [products, setProducts] = useState<Product[]>(mockProducts)
  
  // Dialog states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  // Add form state
  const [newSku, setNewSku] = useState('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCostPrice, setNewCostPrice] = useState('')
  const [newWholesalePrice, setNewWholesalePrice] = useState('')
  const [newRetailPrice, setNewRetailPrice] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newIsActive, setNewIsActive] = useState(true)
  const [newVariants, setNewVariants] = useState<ProductVariant[]>([])
  const [newVariantName, setNewVariantName] = useState('')
  const [newVariantPrice, setNewVariantPrice] = useState('')
  
  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCostPrice, setEditCostPrice] = useState('')
  const [editWholesalePrice, setEditWholesalePrice] = useState('')
  const [editRetailPrice, setEditRetailPrice] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editVariants, setEditVariants] = useState<ProductVariant[]>([])
  const [editVariantName, setEditVariantName] = useState('')
  const [editVariantPrice, setEditVariantPrice] = useState('')
  
  // Show stock columns only for admin and stockman roles
  const showStockColumns = user?.role === 'admin' || user?.role === 'stockman'
  const isAdmin = user?.role === 'admin'

  const resetAddForm = () => {
    setNewSku('')
    setNewName('')
    setNewDescription('')
    setNewCostPrice('')
    setNewWholesalePrice('')
    setNewRetailPrice('')
    setNewCategory('')
    setNewIsActive(true)
    setNewVariants([])
    setNewVariantName('')
    setNewVariantPrice('')
  }

  const handleAddVariant = () => {
    if (!newVariantName.trim()) return
    const variant: ProductVariant = {
      id: `var_${Date.now()}`,
      name: newVariantName.trim(),
      priceAdjustment: parseFloat(newVariantPrice) || 0,
    }
    setNewVariants(prev => [...prev, variant])
    setNewVariantName('')
    setNewVariantPrice('')
  }

  const handleRemoveVariant = (variantId: string) => {
    setNewVariants(prev => prev.filter(v => v.id !== variantId))
  }

  const handleAddEditVariant = () => {
    if (!editVariantName.trim()) {
      toast.error('Variant name is required')
      return
    }
    const variant: ProductVariant = {
      id: `var_${Date.now()}`,
      name: editVariantName.trim(),
      priceAdjustment: parseFloat(editVariantPrice) || 0,
    }
    toast.success(`Variant "${variant.name}" added`)
    setEditVariants(prev => [...prev, variant])
    setEditVariantName('')
    setEditVariantPrice('')
  }

  const handleRemoveEditVariant = (variantId: string) => {
    setEditVariants(prev => prev.filter(v => v.id !== variantId))
  }

  const handleAddProduct = () => {
    if (!newSku.trim() || !newName.trim() || !newCategory) {
      toast.error('SKU, Name, and Category are required')
      return
    }
    if (!newCostPrice || !newWholesalePrice || !newRetailPrice) {
      toast.error('All prices are required')
      return
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      sku: newSku.trim().toUpperCase(),
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      categoryId: newCategory,
      variants: newVariants,
      costPrice: parseFloat(newCostPrice),
      wholesalePrice: parseFloat(newWholesalePrice),
      retailPrice: parseFloat(newRetailPrice),
      images: [],
      isActive: newIsActive,
      createdAt: new Date(),
    }

    setProducts(prev => [newProduct, ...prev])
    setIsAddOpen(false)
    resetAddForm()
    toast.success('Product added successfully')
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsViewOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditName(product.name)
    setEditDescription(product.description || '')
    setEditCostPrice(product.costPrice.toString())
    setEditWholesalePrice(product.wholesalePrice.toString())
    setEditRetailPrice(product.retailPrice.toString())
    setEditCategory(product.categoryId)
    setEditIsActive(product.isActive)
    setEditVariants([...product.variants])
    setEditVariantName('')
    setEditVariantPrice('')
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedProduct) return
    
    setProducts(prev => prev.map(p => 
      p.id === selectedProduct.id 
        ? {
            ...p,
            name: editName,
            description: editDescription || undefined,
            costPrice: parseFloat(editCostPrice) || p.costPrice,
            wholesalePrice: parseFloat(editWholesalePrice) || p.wholesalePrice,
            retailPrice: parseFloat(editRetailPrice) || p.retailPrice,
            categoryId: editCategory,
            isActive: editIsActive,
            variants: editVariants,
          }
        : p
    ))
    setIsEditOpen(false)
    setSelectedProduct(null)
    toast.success('Product updated successfully')
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedProduct) return
    
    setProducts(prev => prev.filter(p => p.id !== selectedProduct.id))
    setIsDeleteOpen(false)
    setSelectedProduct(null)
    toast.success('Product deleted successfully')
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  const pagination = usePagination(filteredProducts, { itemsPerPage: 10 })

  return (
    <DashboardShell
      title="Products"
      description="Manage your product catalog"
      allowedRoles={['admin', 'stockman']}
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
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="size-4 mr-2" />
              Add Product
            </Button>
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
                <TableHead className="text-right">Wholesale Price</TableHead>
                <TableHead className="text-right">Retail Price</TableHead>
                {showStockColumns && (
                  <>
                    <TableHead className="text-right">Wholesale Stock</TableHead>
                    <TableHead className="text-right">Retail Stock</TableHead>
                    <TableHead className="text-right">Shelf Stock</TableHead>
                  </>
                )}
                <TableHead>Availability</TableHead>
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
                    {showStockColumns && (
                      <>
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
                      </>
                    )}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                            <Eye className="size-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Edit className="size-4 mr-2" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your criteria.
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

      {/* Add Product Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open)
        if (!open) resetAddForm()
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product in your catalog
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newSku">SKU *</Label>
                <Input
                  id="newSku"
                  placeholder="e.g., PROD-001"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newName">Product Name *</Label>
              <Input
                id="newName"
                placeholder="Enter product name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newDescription">Description</Label>
              <Input
                id="newDescription"
                placeholder="Brief product description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newCostPrice">Cost Price *</Label>
                <Input
                  id="newCostPrice"
                  type="number"
                  placeholder="0.00"
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newWholesalePrice">Wholesale *</Label>
                <Input
                  id="newWholesalePrice"
                  type="number"
                  placeholder="0.00"
                  value={newWholesalePrice}
                  onChange={(e) => setNewWholesalePrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRetailPrice">Retail *</Label>
                <Input
                  id="newRetailPrice"
                  type="number"
                  placeholder="0.00"
                  value={newRetailPrice}
                  onChange={(e) => setNewRetailPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Variants (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Variant name (e.g., Spicy)"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Price +/-"
                  value={newVariantPrice}
                  onChange={(e) => setNewVariantPrice(e.target.value)}
                  className="w-24"
                />
                <Button type="button" variant="secondary" size="icon" onClick={handleAddVariant}>
                  <Plus className="size-4" />
                </Button>
              </div>
              {newVariants.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newVariants.map(v => (
                    <Badge key={v.id} variant="secondary" className="gap-1 pr-1">
                      {v.name}
                      {v.priceAdjustment !== 0 && (
                        <span className="text-muted-foreground">
                          ({v.priceAdjustment > 0 ? '+' : ''}{formatPeso(v.priceAdjustment)})
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-4 ml-1 hover:bg-destructive/20"
                        onClick={() => handleRemoveVariant(v.id)}
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="newIsActive"
                checked={newIsActive}
                onChange={(e) => setNewIsActive(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="newIsActive">Active (available for sale)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddOpen(false)
              resetAddForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View product information
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">SKU</Label>
                  <p className="font-mono">{selectedProduct.sku}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Category</Label>
                  <p>{getCategoryName(selectedProduct.categoryId)}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Name</Label>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              {selectedProduct.description && (
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-sm">{selectedProduct.description}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Cost Price</Label>
                  <p className="font-medium">{formatPeso(selectedProduct.costPrice)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Wholesale Price</Label>
                  <p className="font-medium">{formatPeso(selectedProduct.wholesalePrice)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Retail Price</Label>
                  <p className="font-medium">{formatPeso(selectedProduct.retailPrice)}</p>
                </div>
              </div>
              {selectedProduct.variants.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">Variants</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
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
              )}
              <div>
                <Label className="text-muted-foreground text-xs">Status</Label>
                <div className="mt-1">
                  <Badge variant={selectedProduct.isActive ? 'default' : 'secondary'}>
                    {selectedProduct.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Input
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCostPrice">Cost Price</Label>
                <Input
                  id="editCostPrice"
                  type="number"
                  value={editCostPrice}
                  onChange={(e) => setEditCostPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editWholesalePrice">Wholesale Price</Label>
                <Input
                  id="editWholesalePrice"
                  type="number"
                  value={editWholesalePrice}
                  onChange={(e) => setEditWholesalePrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRetailPrice">Retail Price</Label>
                <Input
                  id="editRetailPrice"
                  type="number"
                  value={editRetailPrice}
                  onChange={(e) => setEditRetailPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Variants</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Variant name (e.g., Spicy)"
                  value={editVariantName}
                  onChange={(e) => setEditVariantName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Price +/-"
                  value={editVariantPrice}
                  onChange={(e) => setEditVariantPrice(e.target.value)}
                  className="w-24"
                />
                <Button type="button" variant="secondary" size="icon" onClick={handleAddEditVariant}>
                  <Plus className="size-4" />
                </Button>
              </div>
              {editVariants.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editVariants.map(v => (
                    <Badge key={v.id} variant="secondary" className="gap-1 pr-1">
                      {v.name}
                      {v.priceAdjustment !== 0 && (
                        <span className="text-muted-foreground">
                          ({v.priceAdjustment > 0 ? '+' : ''}{formatPeso(v.priceAdjustment)})
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-4 ml-1 hover:bg-destructive/20"
                        onClick={() => handleRemoveEditVariant(v.id)}
                      >
                        <X className="size-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="editIsActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedProduct?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
