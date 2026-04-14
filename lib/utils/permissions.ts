import type { UserRole, NavItem } from '@/lib/types'

// Role-based navigation configuration
export const roleNavigations: Record<UserRole, NavItem[]> = {
  admin: [
    { title: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
    { title: 'POS', href: '/admin/pos', icon: 'ShoppingCart' },
    { title: 'Orders', href: '/admin/orders', icon: 'ClipboardList' },
    { title: 'Transactions', href: '/admin/transactions', icon: 'Receipt' },
    {
      title: 'Inventory',
      href: '/admin/inventory',
      icon: 'Package',
      children: [
        { title: 'Products', href: '/admin/inventory/products' },
        { title: 'Categories', href: '/admin/inventory/categories' },
        { title: 'Stock Levels', href: '/admin/inventory/stock-levels' },
        { title: 'Expiry', href: '/admin/inventory/expiry' },
        { title: 'Receive Stock', href: '/admin/inventory/receive' },
        { title: 'Breakdown', href: '/admin/inventory/breakdown' },
        { title: 'Transfer', href: '/admin/inventory/transfer' },
        { title: 'Adjustments', href: '/admin/inventory/adjustments' },
        { title: 'Movements', href: '/admin/inventory/movements' },
        { title: 'Suppliers', href: '/admin/inventory/suppliers' },
      ],
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: 'BarChart3',
      children: [
        { title: 'Sales Summary', href: '/admin/analytics/sales' },
        { title: 'Sales by Item', href: '/admin/analytics/items' },
        { title: 'Forecast', href: '/admin/analytics/forecast' },
        { title: 'Alerts', href: '/admin/analytics/alerts' },
      ],
    },
    { title: 'Users', href: '/admin/users', icon: 'Settings' },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: 'Settings',
      children: [
        { title: 'General', href: '/admin/settings' },
        { title: 'Access Control', href: '/admin/settings/access-control' },
        { title: 'Activity Log', href: '/admin/settings/activity-log' },
        { title: 'Printers', href: '/admin/settings/printers' },
      ],
    },
  ],
  stockman: [
    { title: 'Dashboard', href: '/stockman/dashboard', icon: 'LayoutDashboard' },
    {
      title: 'Inventory',
      href: '/stockman/inventory',
      icon: 'Package',
      children: [
        { title: 'Stock Levels', href: '/stockman/inventory/stock-levels' },
        { title: 'Receive Stock', href: '/stockman/inventory/receive' },
        { title: 'Breakdown', href: '/stockman/inventory/breakdown' },
        { title: 'Transfer', href: '/stockman/inventory/transfer' },
        { title: 'Adjustments', href: '/stockman/inventory/adjustments' },
        { title: 'Movements', href: '/stockman/inventory/movements' },
      ],
    },
    { title: 'Suppliers', href: '/stockman/suppliers', icon: 'Truck' },
  ],
  cashier: [
    { title: 'Dashboard', href: '/cashier/dashboard', icon: 'LayoutDashboard' },
    { title: 'POS', href: '/cashier/pos', icon: 'ShoppingCart' },
    { title: 'Transactions', href: '/cashier/transactions', icon: 'ClipboardList' },
    { title: 'History', href: '/cashier/history', icon: 'History' },
  ],
  customer: [
    { title: 'Store', href: '/store', icon: 'Store' },
    { title: 'My Orders', href: '/store/orders', icon: 'ClipboardList' },
  ],
}

// Get navigation items for a specific role
export function getNavigation(role: UserRole): NavItem[] {
  return roleNavigations[role] || []
}

// Get the default redirect path for a role after login
export function getDefaultPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'stockman':
      return '/stockman/dashboard'
    case 'cashier':
      return '/cashier/pos'
    case 'customer':
      return '/store'
    default:
      return '/login'
  }
}

// Check if a role can access a specific path
export function canAccessPath(role: UserRole, path: string): boolean {
  const navigation = getNavigation(role)
  
  const checkItems = (items: NavItem[]): boolean => {
    for (const item of items) {
      if (path.startsWith(item.href)) return true
      if (item.children && checkItems(item.children)) return true
    }
    return false
  }
  
  return checkItems(navigation)
}

// Module permissions per role
export const modulePermissions: Record<UserRole, string[]> = {
  admin: ['dashboard', 'pos', 'orders', 'transactions', 'inventory', 'analytics', 'settings', 'users'],
  stockman: ['dashboard', 'inventory', 'suppliers'],
  cashier: ['dashboard', 'pos', 'transactions', 'history'],
  customer: ['store', 'orders'],
}

export function hasModuleAccess(role: UserRole, module: string): boolean {
  return modulePermissions[role]?.includes(module) || false
}
