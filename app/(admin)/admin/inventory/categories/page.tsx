'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { mockCategories } from '@/lib/mock-data/categories'
import { mockProducts } from '@/lib/mock-data/products'
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
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
import type { Category } from '@/lib/types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [editCategory, setEditCategory] = useState({ name: '', description: '', isActive: true })

  // Count products per category
  const categoryProductCounts = categories.map(cat => ({
    ...cat,
    productCount: mockProducts.filter(p => p.categoryId === cat.id).length
  }))

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required')
      return
    }
    
    const category: Category = {
      id: `cat_${Date.now()}`,
      name: newCategory.name.trim(),
      description: newCategory.description.trim() || undefined,
      isActive: true,
    }
    
    setCategories(prev => [...prev, category])
    toast.success('Category created successfully')
    setNewCategory({ name: '', description: '' })
    setIsAddOpen(false)
  }

  const handleEditClick = (cat: Category) => {
    setSelectedCategory(cat)
    setEditCategory({
      name: cat.name,
      description: cat.description || '',
      isActive: cat.isActive,
    })
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!selectedCategory || !editCategory.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setCategories(prev => prev.map(cat =>
      cat.id === selectedCategory.id
        ? {
            ...cat,
            name: editCategory.name.trim(),
            description: editCategory.description.trim() || undefined,
            isActive: editCategory.isActive,
          }
        : cat
    ))
    toast.success('Category updated successfully')
    setIsEditOpen(false)
    setSelectedCategory(null)
  }

  const handleDeleteClick = (cat: Category) => {
    setSelectedCategory(cat)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedCategory) return
    
    const productCount = mockProducts.filter(p => p.categoryId === selectedCategory.id).length
    if (productCount > 0) {
      toast.error(`Cannot delete category with ${productCount} products`)
      setIsDeleteOpen(false)
      setSelectedCategory(null)
      return
    }
    
    setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id))
    toast.success('Category deleted successfully')
    setIsDeleteOpen(false)
    setSelectedCategory(null)
  }

  return (
    <DashboardShell
      title="Categories"
      description="Organize your products into categories"
      allowedRoles={['admin']}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Categories List */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>
                {categories.length} categories
              </CardDescription>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new product category
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Category Name</FieldLabel>
                    <Input
                      placeholder="e.g., Frozen Foods"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Description (Optional)</FieldLabel>
                    <Textarea
                      placeholder="Brief description of the category"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryProductCounts.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="size-4 text-muted-foreground" />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{cat.productCount}</Badge>
                    </TableCell>
                    <TableCell>
                      {cat.isActive ? (
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
                          onClick={() => handleEditClick(cat)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 text-destructive"
                          onClick={() => handleDeleteClick(cat)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Categories</span>
                <span className="font-medium">{categories.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {categories.filter(c => c.isActive).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Products</span>
                <span className="font-medium">{mockProducts.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>By product count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryProductCounts
                  .sort((a, b) => b.productCount - a.productCount)
                  .slice(0, 5)
                  .map((cat, index) => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm">{cat.name}</span>
                      <Badge variant="outline">{cat.productCount}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Category Name</FieldLabel>
              <Input
                placeholder="e.g., Frozen Foods"
                value={editCategory.name}
                onChange={(e) => setEditCategory(prev => ({ ...prev, name: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel>Description (Optional)</FieldLabel>
              <Textarea
                placeholder="Brief description of the category"
                value={editCategory.description}
                onChange={(e) => setEditCategory(prev => ({ ...prev, description: e.target.value }))}
              />
            </Field>
            <Field>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editCategory.isActive}
                  onChange={(e) => setEditCategory(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="size-4 rounded border-input"
                />
                <FieldLabel htmlFor="editIsActive" className="mb-0">Active</FieldLabel>
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? 
              This action cannot be undone.
              {selectedCategory && mockProducts.filter(p => p.categoryId === selectedCategory.id).length > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This category has products assigned to it.
                </span>
              )}
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
