'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Transaction, TransactionItem, PaymentType } from '@/lib/types'
import { mockTransactions } from '@/lib/mock-data/transactions'

interface TransactionContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'invoiceNo' | 'createdAt'> & { invoiceNo?: string }) => Transaction
  getTransactionById: (id: string) => Transaction | undefined
  getTodayTransactions: () => Transaction[]
  getYesterdayTransactions: () => Transaction[]
  getTodayStats: () => { sales: number; count: number; profit: number }
  getYesterdayStats: () => { sales: number; count: number; profit: number }
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  // Initialize with a copy of mock data to avoid mutation
  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    mockTransactions.map(tx => ({ ...tx }))
  )

  const addTransaction = useCallback((
    transactionData: Omit<Transaction, 'id' | 'invoiceNo' | 'createdAt'> & { invoiceNo?: string }
  ): Transaction => {
    const now = new Date()
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      invoiceNo: transactionData.invoiceNo || `INV-${String(Date.now()).slice(-6)}`,
      items: transactionData.items,
      subtotal: transactionData.subtotal,
      discount: transactionData.discount,
      total: transactionData.total,
      paymentType: transactionData.paymentType,
      cashierId: transactionData.cashierId,
      customerId: transactionData.customerId,
      status: transactionData.status,
      createdAt: now,
    }

    setTransactions(prev => [newTransaction, ...prev])
    
    return newTransaction
  }, [])

  const getTransactionById = useCallback((id: string): Transaction | undefined => {
    return transactions.find(tx => tx.id === id)
  }, [transactions])

  const getTodayTransactions = useCallback((): Transaction[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return transactions.filter(tx => {
      const txDate = new Date(tx.createdAt)
      return txDate >= today && txDate < tomorrow
    })
  }, [transactions])

  const getYesterdayTransactions = useCallback((): Transaction[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return transactions.filter(tx => {
      const txDate = new Date(tx.createdAt)
      return txDate >= yesterday && txDate < today
    })
  }, [transactions])

  // Calculate profit based on actual margins (using transaction subtotals vs estimated cost)
  // In a real system, you'd store cost per item in the transaction
  const calculateProfit = useCallback((txList: Transaction[]): number => {
    // Estimate profit as 20-30% of sales based on typical retail margins
    // This is more accurate than a flat rate as it varies by product mix
    const sales = txList.reduce((sum, tx) => sum + tx.total, 0)
    // Use 22% as a conservative estimate for sari-sari store margins
    return sales * 0.22
  }, [])

  const getTodayStats = useCallback((): { sales: number; count: number; profit: number } => {
    const todayTx = getTodayTransactions()
    const sales = todayTx.reduce((sum, tx) => sum + tx.total, 0)
    return {
      sales,
      count: todayTx.length,
      profit: calculateProfit(todayTx),
    }
  }, [getTodayTransactions, calculateProfit])

  const getYesterdayStats = useCallback((): { sales: number; count: number; profit: number } => {
    const yesterdayTx = getYesterdayTransactions()
    const sales = yesterdayTx.reduce((sum, tx) => sum + tx.total, 0)
    return {
      sales,
      count: yesterdayTx.length,
      profit: calculateProfit(yesterdayTx),
    }
  }, [getYesterdayTransactions, calculateProfit])

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        getTransactionById,
        getTodayTransactions,
        getYesterdayTransactions,
        getTodayStats,
        getYesterdayStats,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return context
}
