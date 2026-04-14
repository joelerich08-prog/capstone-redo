import type { ProductBatch, BatchStatus, ExpiryInfo } from '@/lib/types'
import { addDays, subDays, differenceInDays } from 'date-fns'

// Configuration for expiry warnings
export const EXPIRY_WARNING_DAYS = 30 // Days before expiry to show warning
export const EXPIRY_CRITICAL_DAYS = 7  // Days before expiry to show critical warning

// Helper function to calculate expiry status
export function getExpiryInfo(expirationDate: Date, warningDays: number = EXPIRY_WARNING_DAYS): ExpiryInfo {
  const now = new Date()
  const daysUntilExpiry = differenceInDays(expirationDate, now)
  
  let status: BatchStatus = 'active'
  if (daysUntilExpiry <= 0) {
    status = 'expired'
  } else if (daysUntilExpiry <= warningDays) {
    status = 'expiring_soon'
  }
  
  return {
    daysUntilExpiry,
    status,
    isExpired: daysUntilExpiry <= 0,
    isExpiringSoon: daysUntilExpiry > 0 && daysUntilExpiry <= warningDays,
  }
}

// Helper function to generate batch number
export function generateBatchNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `LOT-${year}${month}-${random}`
}

// Mock batches data with various expiry dates
export const mockBatches: ProductBatch[] = [
  // Lucky Sardines - Multiple batches with different expiry dates
  {
    id: 'batch_001',
    productId: 'prod_001',
    batchNumber: 'LOT-202401-A1B2',
    expirationDate: addDays(new Date(), 180), // Expires in 6 months
    manufacturingDate: subDays(new Date(), 30),
    receivedDate: subDays(new Date(), 25),
    wholesaleQty: 5,
    retailQty: 12,
    shelfQty: 24,
    initialQty: 10,
    costPrice: 18,
    supplierId: 'sup_001',
    invoiceNumber: 'INV-2024-001',
    status: 'active',
  },
  {
    id: 'batch_002',
    productId: 'prod_001',
    batchNumber: 'LOT-202312-C3D4',
    expirationDate: addDays(new Date(), 15), // Expiring soon - 15 days
    manufacturingDate: subDays(new Date(), 90),
    receivedDate: subDays(new Date(), 85),
    wholesaleQty: 2,
    retailQty: 6,
    shelfQty: 12,
    initialQty: 5,
    costPrice: 17,
    supplierId: 'sup_001',
    invoiceNumber: 'INV-2023-089',
    status: 'expiring_soon',
  },
  {
    id: 'batch_003',
    productId: 'prod_001',
    batchNumber: 'LOT-202311-E5F6',
    expirationDate: subDays(new Date(), 5), // Already expired
    manufacturingDate: subDays(new Date(), 120),
    receivedDate: subDays(new Date(), 115),
    wholesaleQty: 1,
    retailQty: 3,
    shelfQty: 6,
    initialQty: 3,
    costPrice: 16,
    supplierId: 'sup_001',
    invoiceNumber: 'INV-2023-056',
    status: 'expired',
  },
  
  // Purefoods Corned Beef
  {
    id: 'batch_004',
    productId: 'prod_002',
    batchNumber: 'LOT-202402-G7H8',
    expirationDate: addDays(new Date(), 365), // 1 year shelf life
    manufacturingDate: subDays(new Date(), 15),
    receivedDate: subDays(new Date(), 10),
    wholesaleQty: 8,
    retailQty: 20,
    shelfQty: 35,
    initialQty: 10,
    costPrice: 35,
    supplierId: 'sup_001',
    invoiceNumber: 'INV-2024-015',
    status: 'active',
  },
  
  // Coca-Cola - Multiple batches
  {
    id: 'batch_005',
    productId: 'prod_003',
    batchNumber: 'LOT-202403-I9J0',
    expirationDate: addDays(new Date(), 120), // 4 months
    manufacturingDate: subDays(new Date(), 7),
    receivedDate: subDays(new Date(), 5),
    wholesaleQty: 10,
    retailQty: 20,
    shelfQty: 48,
    initialQty: 15,
    costPrice: 22,
    supplierId: 'sup_005',
    invoiceNumber: 'INV-2024-022',
    status: 'active',
  },
  {
    id: 'batch_006',
    productId: 'prod_003',
    batchNumber: 'LOT-202312-K1L2',
    expirationDate: addDays(new Date(), 5), // Critical - 5 days
    manufacturingDate: subDays(new Date(), 85),
    receivedDate: subDays(new Date(), 80),
    wholesaleQty: 2,
    retailQty: 5,
    shelfQty: 12,
    initialQty: 5,
    costPrice: 21,
    supplierId: 'sup_005',
    invoiceNumber: 'INV-2023-098',
    status: 'expiring_soon',
  },
  
  // Bear Brand Milk - Short shelf life
  {
    id: 'batch_007',
    productId: 'prod_018',
    batchNumber: 'LOT-202403-M3N4',
    expirationDate: addDays(new Date(), 60), // 2 months
    manufacturingDate: subDays(new Date(), 3),
    receivedDate: subDays(new Date(), 2),
    wholesaleQty: 10,
    retailQty: 20,
    shelfQty: 30,
    initialQty: 15,
    costPrice: 20,
    supplierId: 'sup_001',
    invoiceNumber: 'INV-2024-025',
    status: 'active',
  },
  {
    id: 'batch_008',
    productId: 'prod_018',
    batchNumber: 'LOT-202401-O5P6',
    expirationDate: addDays(new Date(), 3), // Critical - 3 days
    manufacturingDate: subDays(new Date(), 55),
    receivedDate: subDays(new Date(), 50),
    wholesaleQty: 2,
    retailQty: 5,
    shelfQty: 10,
    initialQty: 8,
    costPrice: 19,
    supplierId: 'sup_001',
    invoiceNumber: 'INV-2024-003',
    status: 'expiring_soon',
  },
  
  // Eden Cheese
  {
    id: 'batch_009',
    productId: 'prod_020',
    batchNumber: 'LOT-202403-Q7R8',
    expirationDate: addDays(new Date(), 45),
    manufacturingDate: subDays(new Date(), 10),
    receivedDate: subDays(new Date(), 8),
    wholesaleQty: 4,
    retailQty: 8,
    shelfQty: 3,
    initialQty: 6,
    costPrice: 45,
    supplierId: 'sup_001',
    invoiceNumber: 'INV-2024-028',
    status: 'active',
  },
  
  // Piattos
  {
    id: 'batch_010',
    productId: 'prod_006',
    batchNumber: 'LOT-202402-S9T0',
    expirationDate: addDays(new Date(), 90),
    manufacturingDate: subDays(new Date(), 20),
    receivedDate: subDays(new Date(), 18),
    wholesaleQty: 5,
    retailQty: 10,
    shelfQty: 8,
    initialQty: 8,
    costPrice: 28,
    supplierId: 'sup_003',
    invoiceNumber: 'INV-2024-018',
    status: 'active',
  },
  
  // Lucky Me Pancit Canton - High volume
  {
    id: 'batch_011',
    productId: 'prod_015',
    batchNumber: 'LOT-202403-U1V2',
    expirationDate: addDays(new Date(), 180),
    manufacturingDate: subDays(new Date(), 5),
    receivedDate: subDays(new Date(), 3),
    wholesaleQty: 20,
    retailQty: 40,
    shelfQty: 80,
    initialQty: 30,
    costPrice: 10,
    supplierId: 'sup_003',
    invoiceNumber: 'INV-2024-030',
    status: 'active',
  },
  {
    id: 'batch_012',
    productId: 'prod_015',
    batchNumber: 'LOT-202312-W3X4',
    expirationDate: addDays(new Date(), 20),
    manufacturingDate: subDays(new Date(), 70),
    receivedDate: subDays(new Date(), 65),
    wholesaleQty: 5,
    retailQty: 10,
    shelfQty: 20,
    initialQty: 10,
    costPrice: 9.5,
    supplierId: 'sup_003',
    invoiceNumber: 'INV-2023-095',
    status: 'expiring_soon',
  },
  
  // Colgate Toothpaste - Expired batch
  {
    id: 'batch_013',
    productId: 'prod_011',
    batchNumber: 'LOT-202310-Y5Z6',
    expirationDate: subDays(new Date(), 10), // Expired 10 days ago
    manufacturingDate: subDays(new Date(), 200),
    receivedDate: subDays(new Date(), 195),
    wholesaleQty: 2,
    retailQty: 4,
    shelfQty: 0,
    initialQty: 5,
    costPrice: 52,
    supplierId: 'sup_004',
    invoiceNumber: 'INV-2023-045',
    status: 'expired',
  },
  
  // Sprite
  {
    id: 'batch_014',
    productId: 'prod_004',
    batchNumber: 'LOT-202403-A7B8',
    expirationDate: addDays(new Date(), 100),
    manufacturingDate: subDays(new Date(), 10),
    receivedDate: subDays(new Date(), 8),
    wholesaleQty: 12,
    retailQty: 24,
    shelfQty: 60,
    initialQty: 15,
    costPrice: 22,
    supplierId: 'sup_005',
    invoiceNumber: 'INV-2024-032',
    status: 'active',
  },
  
  // Alaska Evaporated Milk
  {
    id: 'batch_015',
    productId: 'prod_019',
    batchNumber: 'LOT-202403-C9D0',
    expirationDate: addDays(new Date(), 240),
    manufacturingDate: subDays(new Date(), 7),
    receivedDate: subDays(new Date(), 5),
    wholesaleQty: 10,
    retailQty: 20,
    shelfQty: 35,
    initialQty: 12,
    costPrice: 38,
    supplierId: 'sup_001',
    invoiceNumber: 'INV-2024-033',
    status: 'active',
  },
]

// Helper functions for batch operations

/**
 * Get all batches for a product
 */
export function getBatchesByProductId(productId: string): ProductBatch[] {
  return mockBatches.filter(b => b.productId === productId)
}

/**
 * Get batches that are expiring soon (within warning days)
 */
export function getExpiringBatches(warningDays: number = EXPIRY_WARNING_DAYS): ProductBatch[] {
  const now = new Date()
  return mockBatches.filter(batch => {
    const daysUntilExpiry = differenceInDays(batch.expirationDate, now)
    return daysUntilExpiry > 0 && daysUntilExpiry <= warningDays && batch.status !== 'disposed'
  }).sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())
}

/**
 * Get batches that are already expired
 */
export function getExpiredBatches(): ProductBatch[] {
  const now = new Date()
  return mockBatches.filter(batch => {
    const daysUntilExpiry = differenceInDays(batch.expirationDate, now)
    return daysUntilExpiry <= 0 && batch.status !== 'disposed'
  })
}

/**
 * Get active batches for a product, sorted by expiry (FEFO - First Expired First Out)
 */
export function getActiveBatchesFEFO(productId: string): ProductBatch[] {
  return mockBatches
    .filter(b => b.productId === productId && b.status !== 'disposed' && b.status !== 'expired')
    .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())
}

/**
 * Get total stock from all batches for a product
 */
export function getTotalStockFromBatches(productId: string): { wholesale: number; retail: number; shelf: number } {
  const batches = getBatchesByProductId(productId).filter(b => b.status !== 'disposed')
  return batches.reduce(
    (acc, batch) => ({
      wholesale: acc.wholesale + batch.wholesaleQty,
      retail: acc.retail + batch.retailQty,
      shelf: acc.shelf + batch.shelfQty,
    }),
    { wholesale: 0, retail: 0, shelf: 0 }
  )
}

/**
 * Get summary statistics for batches
 */
export function getBatchSummary() {
  const now = new Date()
  const total = mockBatches.length
  const active = mockBatches.filter(b => b.status === 'active').length
  const expiringSoon = mockBatches.filter(b => {
    const days = differenceInDays(b.expirationDate, now)
    return days > 0 && days <= EXPIRY_WARNING_DAYS && b.status !== 'disposed'
  }).length
  const expired = mockBatches.filter(b => b.status === 'expired' || differenceInDays(b.expirationDate, now) <= 0).length
  const disposed = mockBatches.filter(b => b.status === 'disposed').length
  
  // Calculate value at risk (items expiring soon)
  const valueAtRisk = mockBatches
    .filter(b => {
      const days = differenceInDays(b.expirationDate, now)
      return days > 0 && days <= EXPIRY_WARNING_DAYS && b.status !== 'disposed'
    })
    .reduce((sum, b) => sum + (b.wholesaleQty + b.retailQty + b.shelfQty) * b.costPrice, 0)
  
  return {
    total,
    active,
    expiringSoon,
    expired,
    disposed,
    valueAtRisk,
  }
}
