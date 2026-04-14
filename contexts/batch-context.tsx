'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { differenceInDays } from 'date-fns'
import {
  mockBatches,
  generateBatchNumber,
  EXPIRY_WARNING_DAYS,
  EXPIRY_CRITICAL_DAYS,
} from '@/lib/mock-data/batches'
import type { ProductBatch, BatchStatus, InventoryTier } from '@/lib/types'

// Callback type for syncing with inventory context
type InventorySyncCallback = (
  productId: string,
  tier: InventoryTier,
  quantityChange: number,
  reason: string,
  notes: string,
  userName: string
) => { success: boolean; error?: string }

interface BatchContextType {
  batches: ProductBatch[]
  
  // Query operations
  getBatchesByProductId: (productId: string) => ProductBatch[]
  getActiveBatchesFEFO: (productId: string) => ProductBatch[]
  getExpiringBatches: (warningDays?: number) => ProductBatch[]
  getExpiredBatches: () => ProductBatch[]
  getCriticalBatches: () => ProductBatch[]
  getBatchSummary: () => {
    total: number
    active: number
    expiringSoon: number
    expired: number
    disposed: number
    valueAtRisk: number
  }
  
  // Stock calculation from batches
  getTotalStockFromBatches: (productId: string) => {
    wholesale: number
    retail: number
    shelf: number
  }
  
  // Mutation operations
  addBatch: (batch: Omit<ProductBatch, 'id' | 'status'>) => ProductBatch
  updateBatchStock: (
    batchId: string,
    tier: InventoryTier,
    quantityChange: number
  ) => { success: boolean; error?: string }
  disposeBatch: (
    batchId: string, 
    reason?: string,
    syncCallback?: InventorySyncCallback,
    userName?: string
  ) => { success: boolean; error?: string; disposedQuantities?: { wholesale: number; retail: number; shelf: number } }
  
  // FEFO operations - now with optional sync callback
  consumeStockFEFO: (
    productId: string,
    tier: InventoryTier,
    quantity: number,
    syncCallback?: InventorySyncCallback,
    userName?: string
  ) => { success: boolean; error?: string; consumedFrom: Array<{ batchId: string; quantity: number }> }
  
  // Rollback consumption - restores batches and optionally syncs inventory
  rollbackConsumption: (
    consumedFrom: Array<{ batchId: string; quantity: number; tier: InventoryTier; productId: string }>,
    syncCallback?: InventorySyncCallback,
    userName?: string
  ) => { success: boolean; error?: string }
  
  // Utility
  refreshBatchStatuses: () => void
}

const BatchContext = createContext<BatchContextType | undefined>(undefined)

export function BatchProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState<ProductBatch[]>(mockBatches)

  // Refresh batch statuses based on current date
  const refreshBatchStatuses = useCallback(() => {
    const now = new Date()
    setBatches(prev =>
      prev.map(batch => {
        if (batch.status === 'disposed') return batch
        
        const daysUntilExpiry = differenceInDays(batch.expirationDate, now)
        let newStatus: BatchStatus = 'active'
        
        if (daysUntilExpiry <= 0) {
          newStatus = 'expired'
        } else if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
          newStatus = 'expiring_soon'
        }
        
        return batch.status !== newStatus ? { ...batch, status: newStatus } : batch
      })
    )
  }, [])

  // Auto-refresh batch statuses on mount and periodically (every 1 hour)
  useEffect(() => {
    // Refresh on mount
    refreshBatchStatuses()

    // Set up periodic refresh (every 1 hour)
    const intervalId = setInterval(() => {
      refreshBatchStatuses()
    }, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(intervalId)
  }, [refreshBatchStatuses])

  // Get batches for a specific product
  const getBatchesByProductId = useCallback(
    (productId: string) => {
      return batches.filter(b => b.productId === productId)
    },
    [batches]
  )

  // Get active batches sorted by expiry (FEFO)
  const getActiveBatchesFEFO = useCallback(
    (productId: string) => {
      return batches
        .filter(
          b =>
            b.productId === productId &&
            b.status !== 'disposed' &&
            b.status !== 'expired'
        )
        .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())
    },
    [batches]
  )

  // Get batches expiring soon
  const getExpiringBatches = useCallback(
    (warningDays: number = EXPIRY_WARNING_DAYS) => {
      const now = new Date()
      return batches
        .filter(batch => {
          const daysUntilExpiry = differenceInDays(batch.expirationDate, now)
          return (
            daysUntilExpiry > 0 &&
            daysUntilExpiry <= warningDays &&
            batch.status !== 'disposed'
          )
        })
        .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())
    },
    [batches]
  )

  // Get critical batches (expiring within critical days)
  const getCriticalBatches = useCallback(() => {
    const now = new Date()
    return batches
      .filter(batch => {
        const daysUntilExpiry = differenceInDays(batch.expirationDate, now)
        return (
          daysUntilExpiry > 0 &&
          daysUntilExpiry <= EXPIRY_CRITICAL_DAYS &&
          batch.status !== 'disposed'
        )
      })
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())
  }, [batches])

  // Get expired batches
  const getExpiredBatches = useCallback(() => {
    const now = new Date()
    return batches.filter(batch => {
      const daysUntilExpiry = differenceInDays(batch.expirationDate, now)
      return daysUntilExpiry <= 0 && batch.status !== 'disposed'
    })
  }, [batches])

  // Get batch summary statistics
  const getBatchSummary = useCallback(() => {
    const now = new Date()
    const total = batches.length
    const active = batches.filter(b => b.status === 'active').length
    const expiringSoon = batches.filter(b => {
      const days = differenceInDays(b.expirationDate, now)
      return days > 0 && days <= EXPIRY_WARNING_DAYS && b.status !== 'disposed'
    }).length
    const expired = batches.filter(
      b =>
        b.status === 'expired' || differenceInDays(b.expirationDate, now) <= 0
    ).length
    const disposed = batches.filter(b => b.status === 'disposed').length

    // Calculate value at risk (items expiring soon)
    const valueAtRisk = batches
      .filter(b => {
        const days = differenceInDays(b.expirationDate, now)
        return days > 0 && days <= EXPIRY_WARNING_DAYS && b.status !== 'disposed'
      })
      .reduce(
        (sum, b) =>
          sum + (b.wholesaleQty + b.retailQty + b.shelfQty) * b.costPrice,
        0
      )

    return {
      total,
      active,
      expiringSoon,
      expired,
      disposed,
      valueAtRisk,
    }
  }, [batches])

  // Get total stock from all batches for a product
  const getTotalStockFromBatches = useCallback(
    (productId: string) => {
      const productBatches = batches.filter(
        b => b.productId === productId && b.status !== 'disposed'
      )
      return productBatches.reduce(
        (acc, batch) => ({
          wholesale: acc.wholesale + batch.wholesaleQty,
          retail: acc.retail + batch.retailQty,
          shelf: acc.shelf + batch.shelfQty,
        }),
        { wholesale: 0, retail: 0, shelf: 0 }
      )
    },
    [batches]
  )

  // Add a new batch
  const addBatch = useCallback(
    (batchData: Omit<ProductBatch, 'id' | 'status'>) => {
      const now = new Date()
      const daysUntilExpiry = differenceInDays(batchData.expirationDate, now)
      
      let status: BatchStatus = 'active'
      if (daysUntilExpiry <= 0) {
        status = 'expired'
      } else if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
        status = 'expiring_soon'
      }

      const newBatch: ProductBatch = {
        ...batchData,
        id: `batch_${Date.now()}`,
        status,
      }

      setBatches(prev => [...prev, newBatch])
      return newBatch
    },
    []
  )

  // Update batch stock
  const updateBatchStock = useCallback(
    (batchId: string, tier: InventoryTier, quantityChange: number) => {
      const batch = batches.find(b => b.id === batchId)
      if (!batch) {
        return { success: false, error: 'Batch not found' }
      }

      let currentQty = 0
      if (tier === 'wholesale') currentQty = batch.wholesaleQty
      else if (tier === 'retail') currentQty = batch.retailQty
      else if (tier === 'shelf') currentQty = batch.shelfQty

      if (quantityChange < 0 && Math.abs(quantityChange) > currentQty) {
        return { success: false, error: 'Insufficient stock in batch' }
      }

      setBatches(prev =>
        prev.map(b => {
          if (b.id === batchId) {
            const updated = { ...b }
            if (tier === 'wholesale') updated.wholesaleQty += quantityChange
            else if (tier === 'retail') updated.retailQty += quantityChange
            else if (tier === 'shelf') updated.shelfQty += quantityChange
            return updated
          }
          return b
        })
      )

      return { success: true }
    },
    [batches]
  )

  // Dispose a batch (mark as disposed) - now syncs with inventory
  const disposeBatch = useCallback(
    (
      batchId: string, 
      reason?: string,
      syncCallback?: InventorySyncCallback,
      userName: string = 'System'
    ) => {
      const batch = batches.find(b => b.id === batchId)
      if (!batch) {
        return { success: false, error: 'Batch not found' }
      }

      // Store quantities before disposal for inventory sync
      const disposedQuantities = {
        wholesale: batch.wholesaleQty,
        retail: batch.retailQty,
        shelf: batch.shelfQty,
      }

      setBatches(prev =>
        prev.map(b => {
          if (b.id === batchId) {
            return {
              ...b,
              status: 'disposed' as BatchStatus,
              wholesaleQty: 0,
              retailQty: 0,
              shelfQty: 0,
              notes: reason
                ? `${b.notes ? b.notes + ' | ' : ''}Disposed: ${reason}`
                : b.notes,
            }
          }
          return b
        })
      )

      // Sync with inventory context if callback provided
      if (syncCallback) {
        const disposeReason = reason || 'Batch disposal'
        if (disposedQuantities.wholesale > 0) {
          syncCallback(batch.productId, 'wholesale', -disposedQuantities.wholesale, 'Disposal', disposeReason, userName)
        }
        if (disposedQuantities.retail > 0) {
          syncCallback(batch.productId, 'retail', -disposedQuantities.retail, 'Disposal', disposeReason, userName)
        }
        if (disposedQuantities.shelf > 0) {
          syncCallback(batch.productId, 'shelf', -disposedQuantities.shelf, 'Disposal', disposeReason, userName)
        }
      }

      return { success: true, disposedQuantities }
    },
    [batches]
  )

  // Consume stock using FEFO (First Expired First Out) - now syncs with inventory
  const consumeStockFEFO = useCallback(
    (
      productId: string, 
      tier: InventoryTier, 
      quantity: number,
      syncCallback?: InventorySyncCallback,
      userName: string = 'System'
    ) => {
      const activeBatches = batches
        .filter(
          b =>
            b.productId === productId &&
            b.status !== 'disposed' &&
            b.status !== 'expired'
        )
        .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())

      // Calculate total available
      let totalAvailable = 0
      activeBatches.forEach(b => {
        if (tier === 'wholesale') totalAvailable += b.wholesaleQty
        else if (tier === 'retail') totalAvailable += b.retailQty
        else if (tier === 'shelf') totalAvailable += b.shelfQty
      })

      if (quantity > totalAvailable) {
        return {
          success: false,
          error: 'Insufficient stock across all batches',
          consumedFrom: [],
        }
      }

      let remaining = quantity
      const consumedFrom: Array<{ batchId: string; quantity: number }> = []
      const updates: Array<{ batchId: string; qty: number }> = []

      for (const batch of activeBatches) {
        if (remaining <= 0) break

        let batchQty = 0
        if (tier === 'wholesale') batchQty = batch.wholesaleQty
        else if (tier === 'retail') batchQty = batch.retailQty
        else if (tier === 'shelf') batchQty = batch.shelfQty

        if (batchQty > 0) {
          const toConsume = Math.min(remaining, batchQty)
          remaining -= toConsume
          consumedFrom.push({ batchId: batch.id, quantity: toConsume })
          updates.push({ batchId: batch.id, qty: -toConsume })
        }
      }

      // Apply updates
      setBatches(prev =>
        prev.map(b => {
          const update = updates.find(u => u.batchId === b.id)
          if (update) {
            const updated = { ...b }
            if (tier === 'wholesale') updated.wholesaleQty += update.qty
            else if (tier === 'retail') updated.retailQty += update.qty
            else if (tier === 'shelf') updated.shelfQty += update.qty
            return updated
          }
          return b
        })
      )

      // Sync with inventory context if callback provided
      if (syncCallback) {
        syncCallback(productId, tier, -quantity, 'Sale', `FEFO consumption`, userName)
      }

      return { success: true, consumedFrom }
    },
    [batches]
  )

  // Rollback batch consumption - restores quantities to batches
  const rollbackConsumption = useCallback(
    (
      consumedFrom: Array<{ batchId: string; quantity: number; tier: InventoryTier; productId: string }>,
      syncCallback?: InventorySyncCallback,
      userName: string = 'System'
    ) => {
      // Restore quantities to batches
      setBatches(prev =>
        prev.map(b => {
          const consumption = consumedFrom.find(c => c.batchId === b.id)
          if (consumption) {
            const updated = { ...b }
            if (consumption.tier === 'wholesale') updated.wholesaleQty += consumption.quantity
            else if (consumption.tier === 'retail') updated.retailQty += consumption.quantity
            else if (consumption.tier === 'shelf') updated.shelfQty += consumption.quantity
            return updated
          }
          return b
        })
      )

      // Sync with inventory context if callback provided
      if (syncCallback) {
        // Group by product and tier for efficient syncing
        const groupedByProductTier = new Map<string, number>()
        consumedFrom.forEach(c => {
          const key = `${c.productId}-${c.tier}`
          const existing = groupedByProductTier.get(key) || 0
          groupedByProductTier.set(key, existing + c.quantity)
        })

        groupedByProductTier.forEach((quantity, key) => {
          const [productId, tier] = key.split('-')
          syncCallback(productId, tier as InventoryTier, quantity, 'Rollback', 'Payment failure rollback', userName)
        })
      }

      return { success: true }
    },
    []
  )

  return (
    <BatchContext.Provider
      value={{
        batches,
        getBatchesByProductId,
        getActiveBatchesFEFO,
        getExpiringBatches,
        getExpiredBatches,
        getCriticalBatches,
        getBatchSummary,
        getTotalStockFromBatches,
        addBatch,
        updateBatchStock,
        disposeBatch,
        consumeStockFEFO,
        rollbackConsumption,
        refreshBatchStatuses,
      }}
    >
      {children}
    </BatchContext.Provider>
  )
}

export function useBatches() {
  const context = useContext(BatchContext)
  if (context === undefined) {
    throw new Error('useBatches must be used within a BatchProvider')
  }
  return context
}
