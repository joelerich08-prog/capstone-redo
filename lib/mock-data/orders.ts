import type { Order, OrderItem, OrderStatus } from '@/lib/types'

export const mockOrders: Order[] = [
  {
    id: 'ord_001',
    orderNo: 'ORD-000001',
    source: 'facebook',
    customerName: 'Ana Mendoza',
    customerPhone: '+63 917 111 2222',
    items: [
      { productId: 'prod_003', productName: 'Coca-Cola', quantity: 6, unitPrice: 30 },
      { productId: 'prod_006', productName: 'Piattos', variantName: 'Cheese', quantity: 3, unitPrice: 38 },
    ],
    total: 294,
    status: 'pending',
    notes: 'Please deliver before 5pm',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'ord_002',
    orderNo: 'ORD-000002',
    source: 'sms',
    customerName: 'Jose Garcia',
    customerPhone: '+63 918 222 3333',
    items: [
      { productId: 'prod_014', productName: 'Jasmine Rice', quantity: 2, unitPrice: 350 },
      { productId: 'prod_016', productName: 'Datu Puti Soy Sauce', quantity: 1, unitPrice: 38 },
    ],
    total: 738,
    status: 'preparing',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 'ord_003',
    orderNo: 'ORD-000003',
    source: 'facebook',
    customerName: 'Maria Clara',
    customerPhone: '+63 919 333 4444',
    items: [
      { productId: 'prod_009', productName: 'Safeguard Soap', variantName: 'Pure White', quantity: 4, unitPrice: 45 },
      { productId: 'prod_011', productName: 'Colgate Toothpaste', quantity: 2, unitPrice: 75 },
      { productId: 'prod_010', productName: 'Palmolive Shampoo', variantName: 'Silky Smooth', quantity: 1, unitPrice: 89 },
    ],
    total: 419,
    status: 'ready',
    notes: 'For pickup at 3pm',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: 'ord_004',
    orderNo: 'ORD-000004',
    source: 'website',
    customerName: 'Ricardo Reyes',
    customerPhone: '+63 920 444 5555',
    items: [
      { productId: 'prod_015', productName: 'Lucky Me Pancit Canton', variantName: 'Original', quantity: 12, unitPrice: 14 },
      { productId: 'prod_018', productName: 'Bear Brand Milk', quantity: 6, unitPrice: 28 },
    ],
    total: 336,
    status: 'completed',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'ord_005',
    orderNo: 'ORD-000005',
    source: 'sms',
    customerName: 'Carmen Santos',
    customerPhone: '+63 921 555 6666',
    items: [
      { productId: 'prod_012', productName: 'Tide Detergent', variantName: 'Original', quantity: 2, unitPrice: 145 },
      { productId: 'prod_013', productName: 'Joy Dishwashing Liquid', variantName: 'Lemon', quantity: 3, unitPrice: 65 },
    ],
    total: 485,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
]

export function getOrdersByStatus(status: OrderStatus): Order[] {
  return mockOrders.filter(order => order.status === status)
}

export function getPendingOrdersCount(): number {
  return mockOrders.filter(order => order.status === 'pending' || order.status === 'preparing').length
}

export function getRecentOrders(limit: number = 5): Order[] {
  return [...mockOrders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}
