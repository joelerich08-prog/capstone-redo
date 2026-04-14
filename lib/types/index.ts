// User & Auth Types
export type UserRole = 'admin' | 'manager' | 'stockman' | 'cashier' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

// Product Types
export interface ProductVariant {
  id: string
  name: string
  priceAdjustment: number
  sku?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  categoryId: string
  supplierId?: string
  variants: ProductVariant[]
  costPrice: number
  wholesalePrice: number
  retailPrice: number
  images: string[]
  isActive: boolean
  createdAt: Date
}

// Category Type
export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive: boolean
}

// Supplier Type
export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  isActive: boolean
}

// Three-Tier Inventory
export interface InventoryLevel {
  id: string
  productId: string
  variantId?: string
  wholesaleQty: number
  retailQty: number
  shelfQty: number
  wholesaleUnit: string
  retailUnit: string
  shelfUnit: 'pack'
  pcsPerPack: number
  packsPerBox: number
  reorderLevel: number
  updatedAt: Date
}

// Transaction Types
export type PaymentType = 'cash' | 'gcash' | 'maya'
export type TransactionStatus = 'completed' | 'refunded' | 'cancelled'

export interface TransactionItem {
  id: string
  productId: string
  variantId?: string
  productName: string
  variantName?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Transaction {
  id: string
  invoiceNo: string
  items: TransactionItem[]
  subtotal: number
  discount: number
  total: number
  paymentType: PaymentType
  cashierId: string
  customerId?: string
  status: TransactionStatus
  createdAt: Date
}

// Stock Movement Types
export type MovementType = 'receive' | 'breakdown' | 'transfer' | 'sale' | 'adjustment' | 'damage' | 'return'
export type InventoryTier = 'wholesale' | 'retail' | 'shelf'

export interface StockMovement {
  id: string
  productId: string
  variantId?: string
  movementType: MovementType
  fromTier?: InventoryTier
  toTier?: InventoryTier
  quantity: number
  reason?: string
  performedBy: string
  createdAt: Date
}

// Online Order Types
export type OrderSource = 'facebook' | 'sms' | 'website'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface OrderItem {
  productId: string
  variantId?: string
  productName: string
  variantName?: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderNo: string
  source: OrderSource
  userId?: string // For logged-in users
  customerName: string
  customerPhone: string
  items: OrderItem[]
  total: number
  paymentMethod?: PaymentType
  status: OrderStatus
  notes?: string
  createdAt: Date
}

// Batch/Lot Types for Expiry Tracking
export type BatchStatus = 'active' | 'expiring_soon' | 'expired' | 'disposed'

export interface ProductBatch {
  id: string
  productId: string
  variantId?: string
  batchNumber: string           // e.g., "LOT-2024-001"
  expirationDate: Date          // When the batch expires
  manufacturingDate?: Date      // Optional: when it was made
  receivedDate: Date            // When you received it
  wholesaleQty: number          // Qty in this batch at wholesale level
  retailQty: number             // Qty in this batch at retail level
  shelfQty: number              // Qty in this batch at shelf level
  initialQty: number            // Original quantity received
  costPrice: number             // Cost can vary per batch
  supplierId: string
  invoiceNumber: string
  status: BatchStatus           // Current status of the batch
  notes?: string
}

// Helper type for expiry status calculation
export interface ExpiryInfo {
  daysUntilExpiry: number
  status: BatchStatus
  isExpired: boolean
  isExpiringSoon: boolean
}

// Alert Types
export type AlertType = 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'system'
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Alert {
  id: string
  type: AlertType
  priority: AlertPriority
  title: string
  message: string
  productId?: string
  isRead: boolean
  createdAt: Date
}

// Activity Log
export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  details?: string
  createdAt: Date
}

// Cart Types (for POS)
export type PurchaseUnitType = 'piece' | 'pack' | 'box'

export interface CartItem {
  productId: string
  variantId?: string
  productName: string
  variantName?: string
  quantity: number
  unitPrice: number
  subtotal: number
  unitType?: PurchaseUnitType  // 'piece' for shelf, 'pack' for retail, 'box' for wholesale
  unitLabel?: string  // Display label like "box", "pack", "piece"
}

// Dashboard Stats
export interface DashboardStats {
  todaySales: number
  todayTransactions: number
  todayProfit: number
  lowStockCount: number
  pendingOrders: number
}

// Navigation Types
export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: number
  children?: NavItem[]
}

// Permission Types
export interface Permission {
  module: string
  actions: ('view' | 'create' | 'edit' | 'delete')[]
}

// Legacy RolePermissions format (array-based)
export interface LegacyRolePermissions {
  role: UserRole
  permissions: Permission[]
}

// Module-based permission structure (used in settings)
export interface ModulePermission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

// Role permissions with module-based structure
export interface RolePermissions {
  dashboard: ModulePermission
  pos: ModulePermission
  inventory: ModulePermission
  products: ModulePermission
  suppliers: ModulePermission
  reports: ModulePermission
  users: ModulePermission
  settings: ModulePermission
}

// Access permissions for all roles
export type AccessPermissions = Record<UserRole, RolePermissions>
