'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { mockOrders } from '@/lib/mock-data/orders'
import type { Order, OrderStatus } from '@/lib/types'
import { isValidPhoneNumber } from '@/lib/utils/validation'

interface OrderContextType {
  orders: Order[]
  addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createdAt'>) => Order | null
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  cancelOrder: (orderId: string) => { success: boolean; error?: string }
  getOrdersByStatus: (status: OrderStatus) => Order[]
  getPendingOrdersCount: () => number
  getOrdersForUser: (userId: string) => Order[]
  lookupOrder: (orderNo: string, phone: string) => Order | null
  validateOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createdAt'>) => { valid: boolean; error?: string }
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

const MAX_ORDERS_PER_MINUTE = 5

export function OrderProvider({ children }: { children: ReactNode }) {
  // Initialize with a copy of mock data to avoid mutation
  const [orders, setOrders] = useState<Order[]>(() => [...mockOrders])
  
  // Track recent orders using useRef to persist across renders but not HMR
  const recentOrderTimestamps = useRef<number[]>([])

  // Validate order data to prevent fake orders
  const validateOrder = useCallback((orderData: Omit<Order, 'id' | 'orderNo' | 'createdAt'>): { valid: boolean; error?: string } => {
    // Check for required fields
    if (!orderData.customerName || orderData.customerName.trim().length < 2) {
      return { valid: false, error: 'Customer name is required and must be at least 2 characters' }
    }

    // Validate phone number format using shared utility
    if (!isValidPhoneNumber(orderData.customerPhone)) {
      return { valid: false, error: 'Please enter a valid Philippine phone number' }
    }

    // Check for empty cart
    if (!orderData.items || orderData.items.length === 0) {
      return { valid: false, error: 'Cannot place an order with no items' }
    }

    // Validate each item
    for (const item of orderData.items) {
      if (!item.productId || !item.productName) {
        return { valid: false, error: 'Invalid product in order' }
      }
      if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return { valid: false, error: 'Invalid quantity for ' + item.productName }
      }
      if (item.unitPrice <= 0) {
        return { valid: false, error: 'Invalid price for ' + item.productName }
      }
    }

    // Validate total matches computed total
    const computedTotal = orderData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    if (Math.abs(computedTotal - orderData.total) > 0.01) {
      return { valid: false, error: 'Order total mismatch - please refresh and try again' }
    }

    // Rate limiting - prevent order spam
    // NOTE: This is client-side rate limiting only. In production, this should be implemented
    // server-side using Redis or a database to prevent bypass and ensure data integrity.
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    
    // Remove old timestamps
    while (recentOrderTimestamps.current.length > 0 && recentOrderTimestamps.current[0] < oneMinuteAgo) {
      recentOrderTimestamps.current.shift()
    }
    
    if (recentOrderTimestamps.current.length >= MAX_ORDERS_PER_MINUTE) {
      return { valid: false, error: 'Too many orders. Please wait a moment and try again.' }
    }

    return { valid: true }
  }, [])

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'orderNo' | 'createdAt'>) => {
    // Validate order before creating
    const validation = validateOrder(orderData)
    if (!validation.valid) {
      // Validation error is returned via the validation result - caller should handle it
      return null
    }

    // Track order timestamp for rate limiting
    recentOrderTimestamps.current.push(Date.now())

    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderNo: `ORD-${String(Date.now()).slice(-6)}`,
      createdAt: new Date(),
    }
    
    setOrders(prev => [newOrder, ...prev])
    
    return newOrder
  }, [validateOrder])

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status }
          : order
      )
    )
  }, [])

  // Cancel an order — only allowed if status is 'pending'
  const cancelOrder = useCallback((orderId: string): { success: boolean; error?: string } => {
    const order = orders.find(o => o.id === orderId)

    if (!order) {
      return { success: false, error: 'Order not found.' }
    }

    if (order.status !== 'pending') {
      return { 
        success: false, 
        error: `This order cannot be cancelled because it is already "${order.status}".`
      }
    }

    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o)
    )

    return { success: true }
  }, [orders])

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(order => order.status === status)
  }, [orders])

  const getPendingOrdersCount = useCallback(() => {
    return orders.filter(order => 
      order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
    ).length
  }, [orders])

  // Get orders for a specific logged-in user
  const getOrdersForUser = useCallback((userId: string) => {
    return orders.filter(order => order.userId === userId)
  }, [orders])

  // Lookup order by order number and phone for guests
  const lookupOrder = useCallback((orderNo: string, phone: string): Order | null => {
    const cleanPhone = phone.replace(/[\s-]/g, '')
    const cleanOrderNo = orderNo.trim().toUpperCase()
    
    const order = orders.find(o => {
      const orderPhone = o.customerPhone.replace(/[\s-]/g, '')
      const matchesOrderNo = o.orderNo.toUpperCase() === cleanOrderNo || 
                             o.id.toUpperCase().includes(cleanOrderNo.replace('ORD-', ''))
      const matchesPhone = orderPhone === cleanPhone || 
                           orderPhone.endsWith(cleanPhone.slice(-10)) ||
                           cleanPhone.endsWith(orderPhone.slice(-10))
      return matchesOrderNo && matchesPhone
    })
    
    return order || null
  }, [orders])

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrderStatus,
      cancelOrder,
      getOrdersByStatus,
      getPendingOrdersCount,
      getOrdersForUser,
      lookupOrder,
      validateOrder,
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider')
  }
  return context
}
