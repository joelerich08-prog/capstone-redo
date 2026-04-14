'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { mockInventoryLevels } from '@/lib/mock-data/products'
import { generateBatchNumber } from '@/lib/mock-data/batches'
import type { InventoryLevel, InventoryTier, ProductBatch } from '@/lib/types'

interface ActivityLogEntry {
  id: string
  type: 'receiving' | 'breakdown' | 'transfer' | 'adjustment'
  description: string
  details: string
  user: string
  timestamp: Date
}

interface InventoryContextType {
  inventoryLevels: InventoryLevel[]
  activityLog: ActivityLogEntry[]
  
  // Transfer operations
  transferStock: (
    productId: string,
    sourceTier: InventoryTier,
    destTier: InventoryTier,
    quantity: number,
    userName: string
  ) => { success: boolean; error?: string }
  
  // Breakdown operations
  breakdownStock: (
    productId: string,
    quantity: number,
    userName: string,
    batchCallback?: (batchData: any) => ProductBatch
  ) => { success: boolean; error?: string; unitsProduced?: number }
  
  // Receiving operations
  receiveStock: (
    items: Array<{
      productId: string
      variantId: string
      variantName: string
      productName: string
      quantity: number
      cost: number
      tier?: InventoryTier  // Optional tier - defaults to wholesale if not specified
    }>,
    supplier: string,
    invoiceNumber: string,
    userName: string
  ) => { success: boolean; error?: string }
  
  // Get inventory for a product
  getInventory: (productId: string) => InventoryLevel | undefined
  
  // Get stock for a specific tier
  getStock: (productId: string, tier: InventoryTier) => number
  
  // Adjustment operations
  adjustStock: (
    productId: string,
    tier: InventoryTier,
    quantityChange: number,
    reason: string,
    notes: string,
    userName: string
  ) => { success: boolean; error?: string }
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>(mockInventoryLevels)
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([
    {
      id: '1',
      type: 'receiving',
      description: 'Received 50 boxes of Lucky Me Pancit Canton',
      details: 'From: ABC Distributors | Invoice: INV-2024-001',
      user: 'Juan Dela Cruz',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      type: 'breakdown',
      description: 'Broke down 10 wholesale boxes to 120 retail packs',
      details: 'Product: Argentina Corned Beef 260g',
      user: 'Juan Dela Cruz',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      type: 'transfer',
      description: 'Transferred 50 units from retail to store shelf',
      details: 'Product: Kopiko 78C 240ml',
      user: 'Maria Santos',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
  ])

  const addActivityLog = useCallback((
    type: ActivityLogEntry['type'],
    description: string,
    details: string,
    user: string
  ) => {
    const newEntry: ActivityLogEntry = {
      id: `act_${Date.now()}`,
      type,
      description,
      details,
      user,
      timestamp: new Date(),
    }
    // Limit activity log to 100 entries to prevent memory issues
    setActivityLog(prev => [newEntry, ...prev].slice(0, 100))
  }, [])

  const getInventory = useCallback((productId: string) => {
    return inventoryLevels.find(inv => inv.productId === productId)
  }, [inventoryLevels])

  const getStock = useCallback((productId: string, tier: InventoryTier) => {
    const inventory = inventoryLevels.find(inv => inv.productId === productId)
    if (!inventory) return 0
    if (tier === 'wholesale') return inventory.wholesaleQty
    if (tier === 'retail') return inventory.retailQty
    if (tier === 'shelf') return inventory.shelfQty
    return 0
  }, [inventoryLevels])

  const transferStock = useCallback((
    productId: string,
    sourceTier: InventoryTier,
    destTier: InventoryTier,
    quantity: number,
    userName: string
  ) => {
    const inventory = inventoryLevels.find(inv => inv.productId === productId)
    if (!inventory) {
      return { success: false, error: 'Product inventory not found' }
    }

    // Get current stock
    let sourceStock = 0
    if (sourceTier === 'wholesale') sourceStock = inventory.wholesaleQty
    else if (sourceTier === 'retail') sourceStock = inventory.retailQty
    else if (sourceTier === 'shelf') sourceStock = inventory.shelfQty

    if (quantity > sourceStock) {
      return { success: false, error: 'Insufficient stock in source tier' }
    }

    // Update inventory
    setInventoryLevels(prev => prev.map(inv => {
      if (inv.productId === productId) {
        const updated = { ...inv, updatedAt: new Date() }
        
        // Decrease source
        if (sourceTier === 'wholesale') updated.wholesaleQty -= quantity
        else if (sourceTier === 'retail') updated.retailQty -= quantity
        else if (sourceTier === 'shelf') updated.shelfQty -= quantity
        
        // Increase destination
        if (destTier === 'wholesale') updated.wholesaleQty += quantity
        else if (destTier === 'retail') updated.retailQty += quantity
        else if (destTier === 'shelf') updated.shelfQty += quantity
        
        return updated
      }
      return inv
    }))

    const tierNames: Record<InventoryTier, string> = {
      wholesale: 'Wholesale',
      retail: 'Retail',
      shelf: 'Store Shelf'
    }

    addActivityLog(
      'transfer',
      `Transferred ${quantity} units from ${tierNames[sourceTier]} to ${tierNames[destTier]}`,
      `Product ID: ${productId}`,
      userName
    )

    return { success: true }
  }, [inventoryLevels, addActivityLog])

  const breakdownStock = useCallback((
    productId: string,
    quantity: number,
    userName: string,
    batchCallback?: (batchData: any) => ProductBatch
  ) => {
    const inventory = inventoryLevels.find(inv => inv.productId === productId)
    if (!inventory) {
      return { success: false, error: 'Product inventory not found' }
    }

    if (quantity > inventory.wholesaleQty) {
      return { success: false, error: 'Insufficient wholesale stock' }
    }

    const unitsProduced = quantity * inventory.packsPerBox

    setInventoryLevels(prev => prev.map(inv => {
      if (inv.productId === productId) {
        return {
          ...inv,
          wholesaleQty: inv.wholesaleQty - quantity,
          retailQty: inv.retailQty + unitsProduced,
          updatedAt: new Date(),
        }
      }
      return inv
    }))

    // Create batch records for broken-down stock if callback provided
    if (batchCallback) {
      batchCallback({
        productId,
        batchNumber: generateBatchNumber(),
        expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        manufacturingDate: new Date(),
        receivedDate: new Date(),
        wholesaleQty: 0,
        retailQty: unitsProduced,  // Breakdown creates retail batches
        shelfQty: 0,
        initialQty: unitsProduced,
        costPrice: 0,  // Cost already accounted for in wholesale batches
        supplierId: 'system',
        invoiceNumber: `BREAKDOWN-${Date.now()}`,
        notes: `Created from breakdown of ${quantity} ${inventory.wholesaleUnit}(s)`,
      })
    }

    addActivityLog(
      'breakdown',
      `Broke down ${quantity} ${inventory.wholesaleUnit}(s) into ${unitsProduced} ${inventory.retailUnit}(s)`,
      `Product ID: ${productId}`,
      userName
    )

    return { success: true, unitsProduced }
  }, [inventoryLevels, addActivityLog])

  const receiveStock = useCallback((
    items: Array<{
      productId: string
      variantId: string
      variantName: string
      productName: string
      quantity: number
      cost: number
      tier?: InventoryTier
    }>,
    supplier: string,
    invoiceNumber: string,
    userName: string
  ) => {
    if (items.length === 0) {
      return { success: false, error: 'No items to receive' }
    }

    // Update inventory for each item - use item's tier if specified, otherwise default to wholesale
    setInventoryLevels(prev => {
      const updated = [...prev]
      items.forEach(item => {
        const index = updated.findIndex(inv => inv.productId === item.productId)
        if (index !== -1) {
          const tier = item.tier || 'wholesale'  // Default to wholesale if not specified
          const updatedInv = { ...updated[index], updatedAt: new Date() }
          
          if (tier === 'wholesale') updatedInv.wholesaleQty += item.quantity
          else if (tier === 'retail') updatedInv.retailQty += item.quantity
          else if (tier === 'shelf') updatedInv.shelfQty += item.quantity
          
          updated[index] = updatedInv
        }
      })
      return updated
    })

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
    const itemsList = items.map(i => `${i.productName} (${i.quantity})`).join(', ')

    addActivityLog(
      'receiving',
      `Received ${totalItems} units across ${items.length} product(s)`,
      `Supplier: ${supplier} | Invoice: ${invoiceNumber} | Items: ${itemsList}`,
      userName
    )

    return { success: true }
  }, [addActivityLog])

  const adjustStock = useCallback((
    productId: string,
    tier: InventoryTier,
    quantityChange: number,
    reason: string,
    notes: string,
    userName: string
  ) => {
    const inventory = inventoryLevels.find(inv => inv.productId === productId)
    if (!inventory) {
      return { success: false, error: 'Product inventory not found' }
    }

    // Get current stock
    let currentStock = 0
    if (tier === 'wholesale') currentStock = inventory.wholesaleQty
    else if (tier === 'retail') currentStock = inventory.retailQty
    else if (tier === 'shelf') currentStock = inventory.shelfQty

    // Check if we have enough stock for removal
    if (quantityChange < 0 && Math.abs(quantityChange) > currentStock) {
      return { success: false, error: 'Insufficient stock' }
    }

    // Update inventory
    setInventoryLevels(prev => prev.map(inv => {
      if (inv.productId === productId) {
        const updated = { ...inv, updatedAt: new Date() }
        
        if (tier === 'wholesale') updated.wholesaleQty += quantityChange
        else if (tier === 'retail') updated.retailQty += quantityChange
        else if (tier === 'shelf') updated.shelfQty += quantityChange
        
        return updated
      }
      return inv
    }))

    const tierNames: Record<InventoryTier, string> = {
      wholesale: 'Wholesale',
      retail: 'Retail',
      shelf: 'Store Shelf'
    }

    const action = quantityChange > 0 ? 'Added' : 'Removed'
    const absQuantity = Math.abs(quantityChange)

    addActivityLog(
      'adjustment',
      `${action} ${absQuantity} unit(s) ${quantityChange > 0 ? 'to' : 'from'} ${tierNames[tier]}`,
      `Product ID: ${productId} | Reason: ${reason} | Notes: ${notes}`,
      userName
    )

    return { success: true }
  }, [inventoryLevels, addActivityLog])

  return (
    <InventoryContext.Provider
      value={{
        inventoryLevels,
        activityLog,
        transferStock,
        breakdownStock,
        receiveStock,
        getInventory,
        getStock,
        adjustStock,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}
