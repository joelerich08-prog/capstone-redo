'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { CartItem } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  itemCount: number
  addItem: (item: Omit<CartItem, 'subtotal'>) => void
  removeItem: (productId: string, variantId?: string, productName?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string, productName?: string) => void
  setDiscount: (discount: number) => void
  clearCart: () => void
  getItemKey: (productId: string, variantId?: string, productName?: string) => string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [discount, setDiscountAmount] = useState(0)

  const getItemKey = useCallback((productId: string, variantId?: string, productName?: string) => {
    // Include productName in key to differentiate same product sold in different units (pack vs box)
    const base = variantId ? `${productId}-${variantId}` : productId
    return productName ? `${base}-${productName}` : base
  }, [])

  const addItem = useCallback((newItem: Omit<CartItem, 'subtotal'>) => {
    setItems(currentItems => {
      const key = getItemKey(newItem.productId, newItem.variantId, newItem.productName)
      const existingIndex = currentItems.findIndex(
        item => getItemKey(item.productId, item.variantId, item.productName) === key
      )

      if (existingIndex >= 0) {
        // Update existing item quantity
        const updated = [...currentItems]
        const existing = updated[existingIndex]
        const newQuantity = existing.quantity + newItem.quantity
        updated[existingIndex] = {
          ...existing,
          quantity: newQuantity,
          subtotal: existing.unitPrice * newQuantity,
        }
        return updated
      }

      // Add new item
      return [
        ...currentItems,
        {
          ...newItem,
          subtotal: newItem.unitPrice * newItem.quantity,
        },
      ]
    })
  }, [getItemKey])

  const removeItem = useCallback((productId: string, variantId?: string, productName?: string) => {
    const key = getItemKey(productId, variantId, productName)
    setItems(currentItems =>
      currentItems.filter(item => getItemKey(item.productId, item.variantId, item.productName) !== key)
    )
  }, [getItemKey])

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string, productName?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId, productName)
      return
    }

    const key = getItemKey(productId, variantId, productName)
    setItems(currentItems =>
      currentItems.map(item => {
        if (getItemKey(item.productId, item.variantId, item.productName) === key) {
          return {
            ...item,
            quantity,
            subtotal: item.unitPrice * quantity,
          }
        }
        return item
      })
    )
  }, [getItemKey, removeItem])

  const setDiscount = useCallback((amount: number) => {
    setDiscountAmount(Math.max(0, amount))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setDiscountAmount(0)
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const total = Math.max(0, subtotal - discount)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        discount,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        setDiscount,
        clearCart,
        getItemKey,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
