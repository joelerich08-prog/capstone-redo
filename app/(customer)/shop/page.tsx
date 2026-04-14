"use client"

import { useState } from "react"
import type { PurchaseUnitType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { mockProducts } from "@/lib/mock-data/products"
import { mockCategories } from "@/lib/mock-data/categories"
import { formatCurrency } from "@/lib/utils/currency"
import { useCart } from "@/contexts/cart-context"
import { useInventory } from "@/contexts/inventory-context"
import { Search, ShoppingCart, Package, SlidersHorizontal, Grid3X3, LayoutList, Minus, Plus, Check, X, BoxesIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<PurchaseUnitType>("pack")
  const { addItem, items } = useCart()
  const { getInventory } = useInventory()



  const filteredProducts = mockProducts
    .filter((product) => {
      if (!product.isActive) return false
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "price-low") return a.retailPrice - b.retailPrice
      if (sortBy === "price-high") return b.retailPrice - a.retailPrice
      return 0
    })

  const handleAddToCart = (
    product: typeof mockProducts[0], 
    qty: number = 1, 
    unitType: PurchaseUnitType = "pack"
  ) => {
    const variant = product.variants[0]
    const inventory = getInventory(product.id)
    
    // Determine price and unit label based on unit type
    const pcsPerPack = inventory?.pcsPerPack || 6
    const packsPerBox = inventory?.packsPerBox || 4
    
    let price: number
    let unitLabel: string
    
    if (unitType === "box") {
      const boxBasePrice = variant ? product.wholesalePrice + variant.priceAdjustment : product.wholesalePrice
      price = boxBasePrice * pcsPerPack * packsPerBox
      unitLabel = inventory?.wholesaleUnit || "box"
    } else {
      // pack
      const packBasePrice = variant ? product.retailPrice + variant.priceAdjustment : product.retailPrice
      price = packBasePrice * pcsPerPack
      unitLabel = inventory?.retailUnit || "pack"
    }
    
    const productNameWithUnit = `${product.name} (${unitLabel})`
    
    addItem({
      productId: product.id,
      variantId: variant?.id,
      productName: productNameWithUnit,
      variantName: variant?.name,
      unitPrice: price,
      quantity: qty,
      unitType: unitType,
      unitLabel: unitLabel,
    })
    toast.success(`${product.name} added to cart`, {
      description: `${qty} ${unitLabel}${qty > 1 ? "s" : ""} added`,
    })
    setSelectedProduct(null)
    setQuantity(1)
    setSelectedUnit("pack")
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId)
  }

  const openProductDialog = (product: typeof mockProducts[0]) => {
    const inventory = getInventory(product.id)
    const packStock = inventory?.retailQty || 0
    const boxStock = inventory?.wholesaleQty || 0
    
    // Default to pack if available, otherwise box
    const defaultUnit: PurchaseUnitType = packStock > 0 ? "pack" : boxStock > 0 ? "box" : "pack"
    
    setSelectedProduct(product)
    setQuantity(1)
    setSelectedUnit(defaultUnit)
  }

  const activeFiltersCount = (selectedCategory !== "all" ? 1 : 0) + (sortBy !== "name" ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full h-11 rounded-xl">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {mockCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Sort By</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full h-11 rounded-xl">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(selectedCategory !== "all" || sortBy !== "name") && (
        <Button 
          variant="outline" 
          className="w-full rounded-xl"
          onClick={() => {
            setSelectedCategory("all")
            setSortBy("name")
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-b">
        <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              Discover Our Products
            </h1>
            <p className="mt-3 text-muted-foreground text-base sm:text-lg text-pretty">
              Browse our curated collection and find exactly what you need
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="mt-6 sm:mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 rounded-xl bg-background border-border/60 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredProducts.length}</span> products
            </p>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="rounded-full">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px] h-10 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-10 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mobile Filter Button */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden h-10 rounded-xl relative">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-3xl">
                <SheetHeader className="pb-4">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <FilterContent />
                <div className="pt-6 pb-2">
                  <Button className="w-full h-12 rounded-xl" onClick={() => setFilterSheetOpen(false)}>
                    Show {filteredProducts.length} products
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border bg-muted/30 p-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg",
                  viewMode === "grid" && "bg-background shadow-sm"
                )}
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg",
                  viewMode === "list" && "bg-background shadow-sm"
                )}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const variant = product.variants[0]
              const inventory = getInventory(product.id)
              const pcsPerPack = inventory?.pcsPerPack || 6
              const packPrice = variant 
                ? (product.retailPrice + variant.priceAdjustment) * pcsPerPack 
                : product.retailPrice * pcsPerPack
              const packStock = inventory?.retailQty || 0
              const boxStock = inventory?.wholesaleQty || 0
              const inStock = packStock > 0 || boxStock > 0
              const category = mockCategories.find(c => c.id === product.categoryId)
              const inCart = isInCart(product.id)
              const packLabel = inventory?.retailUnit || "pack"

              return (
                <Card 
                  key={product.id} 
                  className={cn(
                    "group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-border cursor-pointer",
                    !inStock && "opacity-75"
                  )}
                  onClick={() => openProductDialog(product)}
                >
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 transition-transform duration-300 group-hover:scale-110" />
                    
                    {/* Status Badges */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                      {category && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs rounded-lg bg-background/90 backdrop-blur-sm shadow-sm">
                          {category.name}
                        </Badge>
                      )}
                      {inCart && inStock && (
                        <Badge className="bg-success text-success-foreground text-[10px] sm:text-xs rounded-lg shadow-sm">
                          <Check className="h-3 w-3 mr-0.5" />
                          <span className="hidden sm:inline">In Cart</span>
                        </Badge>
                      )}
                    </div>
                    
                    {!inStock && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] leading-tight">
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
                        onClick={(e) => {
                          e.stopPropagation()
                          openProductDialog(product)
                        }}
                        disabled={!inStock}
                      >
                        {inStock ? (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5 sm:mr-1.5" />
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
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const variant = product.variants[0]
              const inventory = getInventory(product.id)
              const pcsPerPack = inventory?.pcsPerPack || 6
              const packPrice = variant 
                ? (product.retailPrice + variant.priceAdjustment) * pcsPerPack 
                : product.retailPrice * pcsPerPack
              const packStock = inventory?.retailQty || 0
              const boxStock = inventory?.wholesaleQty || 0
              const inStock = packStock > 0 || boxStock > 0
              const category = mockCategories.find(c => c.id === product.categoryId)
              const inCart = isInCart(product.id)
              const packLabel = inventory?.retailUnit || "pack"

              return (
                <Card 
                  key={product.id} 
                  className={cn(
                    "overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-border cursor-pointer",
                    !inStock && "opacity-75"
                  )}
                  onClick={() => openProductDialog(product)}
                >
                  <CardContent className="p-3 sm:p-4 flex gap-3 sm:gap-4">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0 relative">
                      <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
                      {inCart && (
                        <div className="absolute -top-1 -right-1">
                          <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center shadow-sm">
                            <Check className="h-3 w-3 text-success-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                          {category && (
                            <Badge variant="secondary" className="text-[10px] rounded-md shrink-0">
                              {category.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {variant?.name || "Standard"} | {packStock} {packLabel}s, {boxStock} boxes
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
                          className="h-9 sm:h-10 rounded-xl shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openProductDialog(product)
                          }}
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
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Try adjusting your search or filters to find what you&apos;re looking for
            </p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-xl"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSortBy("name")
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => { setSelectedProduct(null); setQuantity(1); setSelectedUnit("pack") }}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {selectedProduct && (() => {
            const variant = selectedProduct.variants[0]
            const inventory = getInventory(selectedProduct.id)
            const category = mockCategories.find(c => c.id === selectedProduct.categoryId)
            
            // Calculate prices for each unit type
            const packPrice = variant ? selectedProduct.retailPrice + variant.priceAdjustment : selectedProduct.retailPrice
            const boxPrice = variant ? selectedProduct.wholesalePrice + variant.priceAdjustment : selectedProduct.wholesalePrice
            
            // Get stock quantities for each unit type
            const packStock = inventory?.retailQty || 0
            const boxStock = inventory?.wholesaleQty || 0
            
            // Get unit labels
            const packLabel = inventory?.retailUnit || "pack"
            const boxLabel = inventory?.wholesaleUnit || "box"
            
            // Pieces per pack info
            const pcsPerPack = inventory?.pcsPerPack || 6
            const packsPerBox = inventory?.packsPerBox || 4
            
            // Current selection values
            const currentStock = selectedUnit === "box" ? boxStock : packStock
            const currentLabel = selectedUnit === "box" ? boxLabel : packLabel
            const currentUnitPrice = selectedUnit === "box" 
              ? boxPrice * pcsPerPack * packsPerBox 
              : packPrice * pcsPerPack
            
            return (
              <>
                {/* Product Image */}
                <div className="h-48 sm:h-56 bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center relative flex-shrink-0">
                  <Package className="h-20 w-20 text-muted-foreground/40" />
                  {category && (
                    <Badge variant="secondary" className="absolute top-3 left-3 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm">
                      {category.name}
                    </Badge>
                  )}
                  {selectedUnit === "box" && (
                    <Badge className="absolute top-3 right-3 rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <BoxesIcon className="h-3 w-3 mr-1" />
                      Wholesale
                    </Badge>
                  )}
                  {packStock === 0 && boxStock === 0 && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <Badge variant="secondary" className="text-sm px-4 py-1">Out of Stock</Badge>
                    </div>
                  )}
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">
                  <div className="p-5 sm:p-6">
                    <DialogHeader className="text-left space-y-1 mb-5">
                      <DialogTitle className="text-xl font-semibold leading-tight">
                        {selectedProduct.name}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        {variant?.name || "Standard"} &bull; {currentStock > 0 ? `${currentStock} ${currentLabel}${currentStock !== 1 ? "s" : ""} available` : "Out of stock"}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Unit Type Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Purchase Type</label>
                        <Tabs value={selectedUnit} onValueChange={(v) => { setSelectedUnit(v as PurchaseUnitType); setQuantity(1); }} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/50 rounded-xl">
                            <TabsTrigger 
                              value="pack" 
                              className="flex flex-col items-center gap-0.5 py-2.5 px-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                              disabled={packStock === 0}
                            >
                              <span className="text-xs font-medium capitalize">{packLabel}</span>
                              <span className="text-sm font-bold text-primary tabular-nums">{formatCurrency(packPrice * pcsPerPack)}</span>
                              <span className="text-[10px] text-muted-foreground">{packStock} avail</span>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="box" 
                              className="flex flex-col items-center gap-0.5 py-2.5 px-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                              disabled={boxStock === 0}
                            >
                              <span className="text-xs font-medium capitalize">{boxLabel}</span>
                              <span className="text-sm font-bold text-primary tabular-nums">{formatCurrency(boxPrice * pcsPerPack * packsPerBox)}</span>
                              <span className="text-[10px] text-muted-foreground">{boxStock} avail</span>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                        {selectedUnit === "box" && (
                          <p className="text-xs text-success flex items-center gap-1 mt-1">
                            <Check className="h-3 w-3" />
                            Wholesale price applied
                          </p>
                        )}
                        {selectedUnit === "pack" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {pcsPerPack} pcs per {packLabel} &bull; {packsPerBox} {packLabel}s per {boxLabel}
                          </p>
                        )}
                      </div>
                      
                      {/* Price Display */}
                      <div className="flex items-center justify-between py-3 px-4 bg-accent/50 rounded-xl">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Price per {currentLabel}</p>
                          <span className="text-2xl font-bold text-primary tabular-nums">
                            {formatCurrency(currentUnitPrice)}
                          </span>
                        </div>
                        {currentStock > 0 && currentStock <= 5 ? (
                          <Badge variant="secondary" className="text-warning bg-warning/10 border-warning/20">
                            Only {currentStock} left
                          </Badge>
                        ) : currentStock === 0 ? (
                          <Badge variant="secondary">Out of stock</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-success bg-success/10 border-success/20">
                            In stock
                          </Badge>
                        )}
                      </div>
                      
                      {/* Quantity */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Quantity</span>
                        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-semibold tabular-nums">{quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                            disabled={quantity >= currentStock || currentStock === 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between text-sm border-t pt-3">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-lg tabular-nums">
                          {formatCurrency(currentUnitPrice * quantity)}
                        </span>
                      </div>
                      
                      <Button
                        className="w-full h-12 rounded-xl text-base font-semibold shadow-sm"
                        size="lg"
                        onClick={() => handleAddToCart(selectedProduct, quantity, selectedUnit)}
                        disabled={currentStock === 0}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add {quantity} {currentLabel}{quantity > 1 ? "s" : ""} to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
