"use client"

import { useState } from "react"
import { StockmanShell } from "@/components/layout/stockman-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mockSuppliers } from "@/lib/mock-data/suppliers"
import type { Supplier } from "@/lib/types"
import { mockProducts } from "@/lib/mock-data/products"
import { getCategoryName } from "@/lib/mock-data/categories"
import { Search, Phone, Mail, MapPin, Truck, Package } from "lucide-react"
import { usePagination } from "@/hooks/use-pagination"
import { TablePagination } from "@/components/shared/table-pagination"

export default function StockmanSuppliersPage() {
  const [search, setSearch] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<(Supplier & { productCount: number }) | null>(null)

  const suppliersWithProductCount = mockSuppliers.map(sup => ({
    ...sup,
    productCount: mockProducts.filter(p => p.supplierId === sup.id).length
  }))

  const filteredSuppliers = suppliersWithProductCount.filter(sup =>
    sup.name.toLowerCase().includes(search.toLowerCase()) ||
    sup.contactPerson?.toLowerCase().includes(search.toLowerCase())
  )

  const pagination = usePagination(filteredSuppliers, { itemsPerPage: 10 })

  return (
    <StockmanShell title="Suppliers" description="View supplier directory and contacts">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Supplier Directory</CardTitle>
            <CardDescription>
              {mockSuppliers.length} suppliers in your network
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.map(sup => (
                <TableRow 
                  key={sup.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedSupplier(sup)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                        <Truck className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium">{sup.name}</div>
                        {sup.address && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="size-3" />
                            <span className="truncate max-w-[200px]">{sup.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{sup.contactPerson || "-"}</TableCell>
                  <TableCell>
                    {sup.phone ? (
                      <a 
                        href={`tel:${sup.phone}`}
                        className="flex items-center gap-1 text-sm hover:text-primary"
                      >
                        <Phone className="size-3" />
                        {sup.phone}
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {sup.email ? (
                      <a 
                        href={`mailto:${sup.email}`}
                        className="flex items-center gap-1 text-sm hover:text-primary"
                      >
                        <Mail className="size-3" />
                        {sup.email}
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{sup.productCount}</Badge>
                  </TableCell>
                  <TableCell>
                    {sup.isActive ? (
                      <Badge className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No suppliers found.
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

      {/* Supplier Detail Dialog */}
      <Dialog open={!!selectedSupplier} onOpenChange={(open) => !open && setSelectedSupplier(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Truck className="size-5" />
              </div>
              {selectedSupplier?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedSupplier && (
            <div className="space-y-4">
              {/* Status */}
              <div>
                {selectedSupplier.isActive ? (
                  <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    Active Supplier
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                
                {selectedSupplier.contactPerson && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">Contact:</span>
                    <span className="text-sm font-medium">{selectedSupplier.contactPerson}</span>
                  </div>
                )}
                
                {selectedSupplier.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">Phone:</span>
                    <a 
                      href={`tel:${selectedSupplier.phone}`}
                      className="text-sm font-medium flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="size-3" />
                      {selectedSupplier.phone}
                    </a>
                  </div>
                )}
                
                {selectedSupplier.email && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">Email:</span>
                    <a 
                      href={`mailto:${selectedSupplier.email}`}
                      className="text-sm font-medium flex items-center gap-1 hover:text-primary"
                    >
                      <Mail className="size-3" />
                      {selectedSupplier.email}
                    </a>
                  </div>
                )}
                
                {selectedSupplier.address && (
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-muted-foreground w-24">Address:</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="size-3 shrink-0" />
                      {selectedSupplier.address}
                    </span>
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">Products Supplied</h4>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Package className="size-3" />
                    {selectedSupplier.productCount} products
                  </Badge>
                </div>
                
                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                  {mockProducts
                    .filter(p => p.supplierId === selectedSupplier.id)
                    .map(product => (
                      <div key={product.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                        <span>{product.name}</span>
                        <Badge variant="outline" className="text-xs">{getCategoryName(product.categoryId)}</Badge>
                      </div>
                    ))}
                  {selectedSupplier.productCount === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No products from this supplier
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StockmanShell>
  )
}
