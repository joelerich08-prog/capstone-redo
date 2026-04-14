'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { mockSuppliers } from '@/lib/mock-data/suppliers'
import type { Supplier } from '@/lib/types'
import { mockProducts } from '@/lib/mock-data/products'
import { Plus, Search, Phone, Mail, MapPin, Edit, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { usePagination } from '@/hooks/use-pagination'
import { TablePagination } from '@/components/shared/table-pagination'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [search, setSearch] = useState('')
  
  // Add dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newContactPerson, setNewContactPerson] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newAddress, setNewAddress] = useState('')
  
  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [editName, setEditName] = useState('')
  const [editContactPerson, setEditContactPerson] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  
  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

  const suppliersWithProductCount = suppliers.map(sup => ({
    ...sup,
    productCount: mockProducts.filter(p => p.supplierId === sup.id).length
  }))

  const filteredSuppliers = suppliersWithProductCount.filter(sup =>
    sup.name.toLowerCase().includes(search.toLowerCase()) ||
    sup.contactPerson?.toLowerCase().includes(search.toLowerCase())
  )

  const pagination = usePagination(filteredSuppliers, { itemsPerPage: 10 })

  const resetAddForm = () => {
    setNewName('')
    setNewContactPerson('')
    setNewPhone('')
    setNewEmail('')
    setNewAddress('')
  }

  const handleAddSupplier = () => {
    if (!newName.trim()) {
      toast.error('Company name is required')
      return
    }

    const newSupplier: Supplier = {
      id: `sup_${Date.now()}`,
      name: newName.trim(),
      contactPerson: newContactPerson.trim() || undefined,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      address: newAddress.trim() || undefined,
      isActive: true,
    }

    setSuppliers(prev => [...prev, newSupplier])
    toast.success('Supplier added successfully')
    resetAddForm()
    setIsAddOpen(false)
  }

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setEditName(supplier.name)
    setEditContactPerson(supplier.contactPerson || '')
    setEditPhone(supplier.phone || '')
    setEditEmail(supplier.email || '')
    setEditAddress(supplier.address || '')
    setEditIsActive(supplier.isActive)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedSupplier) return
    
    if (!editName.trim()) {
      toast.error('Company name is required')
      return
    }

    setSuppliers(prev => prev.map(sup => 
      sup.id === selectedSupplier.id
        ? {
            ...sup,
            name: editName.trim(),
            contactPerson: editContactPerson.trim() || undefined,
            phone: editPhone.trim() || undefined,
            email: editEmail.trim() || undefined,
            address: editAddress.trim() || undefined,
            isActive: editIsActive,
          }
        : sup
    ))

    toast.success('Supplier updated successfully')
    setIsEditOpen(false)
    setSelectedSupplier(null)
  }

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!supplierToDelete) return

    setSuppliers(prev => prev.filter(sup => sup.id !== supplierToDelete.id))
    toast.success('Supplier deleted successfully')
    setIsDeleteOpen(false)
    setSupplierToDelete(null)
  }

  return (
    <DashboardShell
      title="Suppliers"
      description="Manage your supplier directory"
      allowedRoles={['admin']}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Supplier Directory</CardTitle>
            <CardDescription>
              {suppliers.length} suppliers in your network
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open)
            if (!open) resetAddForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Add a new supplier to your directory
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel>Company Name *</FieldLabel>
                  <Input 
                    placeholder="e.g., ABC Trading Corp." 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Contact Person</FieldLabel>
                  <Input 
                    placeholder="e.g., Juan Dela Cruz" 
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Phone</FieldLabel>
                    <Input 
                      placeholder="+63 9XX XXX XXXX" 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input 
                      type="email" 
                      placeholder="contact@supplier.com" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Address</FieldLabel>
                  <Textarea 
                    placeholder="Full address" 
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  resetAddForm()
                  setIsAddOpen(false)
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier}>
                  Add Supplier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedItems.map(sup => (
                <TableRow key={sup.id}>
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
                  <TableCell>{sup.contactPerson || '-'}</TableCell>
                  <TableCell>
                    {sup.phone ? (
                      <a 
                        href={`tel:${sup.phone}`}
                        className="flex items-center gap-1 text-sm hover:text-primary"
                      >
                        <Phone className="size-3" />
                        {sup.phone}
                      </a>
                    ) : '-'}
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
                    ) : '-'}
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
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8"
                        onClick={() => handleEditClick(sup)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 text-destructive"
                        onClick={() => handleDeleteClick(sup)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No suppliers found.
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Company Name *</FieldLabel>
              <Input 
                placeholder="e.g., ABC Trading Corp." 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Contact Person</FieldLabel>
              <Input 
                placeholder="e.g., Juan Dela Cruz" 
                value={editContactPerson}
                onChange={(e) => setEditContactPerson(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Phone</FieldLabel>
                <Input 
                  placeholder="+63 9XX XXX XXXX" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input 
                  type="email" 
                  placeholder="contact@supplier.com" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Address</FieldLabel>
              <Textarea 
                placeholder="Full address" 
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel className="mb-0">Active Status</FieldLabel>
                <Switch 
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
              </div>
            </Field>
          </FieldGroup>
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
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{supplierToDelete?.name}</strong>? 
              This action cannot be undone.
              {supplierToDelete && suppliersWithProductCount.find(s => s.id === supplierToDelete.id)?.productCount > 0 && (
                <>
                  <br /><br />
                  <span className="text-destructive">
                    Warning: This supplier has associated products that will need to be reassigned.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
