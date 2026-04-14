import type { Transaction, TransactionItem, DashboardStats } from '@/lib/types'

// Generate realistic transactions for the past 30 days
function generateTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  const paymentTypes: ('cash' | 'gcash' | 'maya')[] = ['cash', 'gcash', 'maya']
  
  const productOptions = [
    { id: 'prod_001', name: 'Lucky Sardines', price: 25 },
    { id: 'prod_002', name: 'Purefoods Corned Beef', price: 48 },
    { id: 'prod_003', name: 'Coca-Cola', price: 30 },
    { id: 'prod_004', name: 'Sprite', price: 30 },
    { id: 'prod_005', name: 'C2 Green Tea', price: 25 },
    { id: 'prod_006', name: 'Piattos', price: 38 },
    { id: 'prod_007', name: 'Nova Chips', price: 35 },
    { id: 'prod_008', name: 'Skyflakes Crackers', price: 12 },
    { id: 'prod_009', name: 'Safeguard Soap', price: 45 },
    { id: 'prod_010', name: 'Palmolive Shampoo', price: 89 },
    { id: 'prod_015', name: 'Lucky Me Pancit Canton', price: 14 },
    { id: 'prod_018', name: 'Bear Brand Milk', price: 28 },
  ]

  const now = new Date()
  let invoiceCounter = 1000

  // Generate transactions for the past 30 days
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    
    // More transactions on weekends
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const transactionsPerDay = isWeekend ? Math.floor(Math.random() * 15) + 20 : Math.floor(Math.random() * 10) + 12

    for (let i = 0; i < transactionsPerDay; i++) {
      const itemCount = Math.floor(Math.random() * 4) + 1
      const items: TransactionItem[] = []
      
      const selectedProducts = [...productOptions]
        .sort(() => Math.random() - 0.5)
        .slice(0, itemCount)

      selectedProducts.forEach((product, index) => {
        const quantity = Math.floor(Math.random() * 3) + 1
        items.push({
          id: `item_${invoiceCounter}_${index}`,
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          subtotal: product.price * quantity,
        })
      })

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
      const discount = Math.random() < 0.1 ? Math.floor(subtotal * 0.05) : 0
      const total = subtotal - discount

      // Set transaction time randomly throughout business hours (8am - 9pm)
      const txDate = new Date(date)
      txDate.setHours(8 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60), 0, 0)

      transactions.push({
        id: `tx_${invoiceCounter}`,
        invoiceNo: `INV-${String(invoiceCounter).padStart(6, '0')}`,
        items,
        subtotal,
        discount,
        total,
        paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
        cashierId: 'usr_003',
        status: 'completed',
        createdAt: txDate,
      })

      invoiceCounter++
    }
  }

  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export const mockTransactions = generateTransactions()

// Helper functions
export function getTodayTransactions(): Transaction[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return mockTransactions.filter(tx => {
    const txDate = new Date(tx.createdAt)
    txDate.setHours(0, 0, 0, 0)
    return txDate.getTime() === today.getTime()
  })
}

export function getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
  return mockTransactions.filter(tx => {
    const txDate = new Date(tx.createdAt)
    return txDate >= startDate && txDate <= endDate
  })
}

export function calculateDashboardStats(): DashboardStats {
  const todayTx = getTodayTransactions()
  const todaySales = todayTx.reduce((sum, tx) => sum + tx.total, 0)
  const todayProfit = todaySales * 0.25 // Approximate 25% margin

  return {
    todaySales,
    todayTransactions: todayTx.length,
    todayProfit,
    lowStockCount: 5, // Will be calculated from inventory
    pendingOrders: 3, // Will be calculated from orders
  }
}

export function getSalesByDay(days: number = 7): { date: string; sales: number; transactions: number }[] {
  const result: { date: string; sales: number; transactions: number }[] = []
  const now = new Date()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const dayTransactions = mockTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt)
      return txDate >= date && txDate < nextDate
    })
    
    result.push({
      date: `${months[date.getMonth()]} ${date.getDate()}`,
      sales: dayTransactions.reduce((sum, tx) => sum + tx.total, 0),
      transactions: dayTransactions.length,
    })
  }

  return result
}

export function getTopSellingItems(limit: number = 5): { name: string; quantity: number; revenue: number }[] {
  const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {}

  mockTransactions.forEach(tx => {
    tx.items.forEach(item => {
      if (!itemSales[item.productId]) {
        itemSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 }
      }
      itemSales[item.productId].quantity += item.quantity
      itemSales[item.productId].revenue += item.subtotal
    })
  })

  return Object.values(itemSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export function getSalesByPaymentType(): { type: string; total: number; count: number }[] {
  const result: Record<string, { total: number; count: number }> = {
    cash: { total: 0, count: 0 },
    gcash: { total: 0, count: 0 },
    maya: { total: 0, count: 0 },
  }

  mockTransactions.forEach(tx => {
    result[tx.paymentType].total += tx.total
    result[tx.paymentType].count++
  })

  return [
    { type: 'Cash', total: result.cash.total, count: result.cash.count },
    { type: 'GCash', total: result.gcash.total, count: result.gcash.count },
    { type: 'Maya', total: result.maya.total, count: result.maya.count },
  ]
}

export function getSalesByDateRange(startDate: Date, endDate: Date): { date: string; sales: number; transactions: number }[] {
  const result: { date: string; sales: number; transactions: number }[] = []
  
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const current = new Date(start)
  while (current <= end) {
    const dayStart = new Date(current)
    const dayEnd = new Date(current)
    dayEnd.setHours(23, 59, 59, 999)

    const dayTransactions = mockTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt)
      return txDate >= dayStart && txDate <= dayEnd
    })

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    result.push({
      date: `${months[current.getMonth()]} ${current.getDate()}`,
      sales: dayTransactions.reduce((sum, tx) => sum + tx.total, 0),
      transactions: dayTransactions.length,
    })

    current.setDate(current.getDate() + 1)
  }

  return result
}

export function getPaymentTypesByDateRange(startDate: Date, endDate: Date): { type: string; total: number; count: number }[] {
  const result: Record<string, { total: number; count: number }> = {
    cash: { total: 0, count: 0 },
    gcash: { total: 0, count: 0 },
    maya: { total: 0, count: 0 },
  }

  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  mockTransactions
    .filter(tx => {
      const txDate = new Date(tx.createdAt)
      return txDate >= start && txDate <= end
    })
    .forEach(tx => {
      result[tx.paymentType].total += tx.total
      result[tx.paymentType].count++
    })

  return [
    { type: 'Cash', total: result.cash.total, count: result.cash.count },
    { type: 'GCash', total: result.gcash.total, count: result.gcash.count },
    { type: 'Maya', total: result.maya.total, count: result.maya.count },
  ]
}

// ============================================
// SALES FORECASTING FUNCTIONS
// Uses Weighted Moving Average with Day-of-Week Seasonality
// ============================================

interface DailySalesData {
  date: Date
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  sales: number
  transactions: number
}

interface ForecastResult {
  date: string
  fullDate: Date
  actual: number | null
  forecast: number | null
  isForecast: boolean
  confidence?: { lower: number; upper: number }
}

/**
 * Get daily sales data for the specified number of past days
 */
export function getDailySalesHistory(days: number = 30): DailySalesData[] {
  const result: DailySalesData[] = []
  const now = new Date()
  now.setHours(23, 59, 59, 999)

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayTransactions = mockTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt)
      return txDate >= date && txDate <= dayEnd
    })
    
    result.push({
      date: new Date(date),
      dayOfWeek: date.getDay(),
      sales: dayTransactions.reduce((sum, tx) => sum + tx.total, 0),
      transactions: dayTransactions.length,
    })
  }

  return result
}

/**
 * Calculate day-of-week seasonality indices
 * Index > 1 means that day typically has higher sales than average
 * Index < 1 means that day typically has lower sales than average
 */
function calculateSeasonalityIndices(history: DailySalesData[]): Record<number, number> {
  const dayTotals: Record<number, { sum: number; count: number }> = {}
  
  // Initialize
  for (let i = 0; i < 7; i++) {
    dayTotals[i] = { sum: 0, count: 0 }
  }
  
  // Sum sales by day of week
  history.forEach(day => {
    dayTotals[day.dayOfWeek].sum += day.sales
    dayTotals[day.dayOfWeek].count++
  })
  
  // Calculate average for each day
  const dayAverages: Record<number, number> = {}
  for (let i = 0; i < 7; i++) {
    dayAverages[i] = dayTotals[i].count > 0 ? dayTotals[i].sum / dayTotals[i].count : 0
  }
  
  // Calculate overall average
  const overallAverage = history.reduce((sum, d) => sum + d.sales, 0) / history.length
  
  // Calculate seasonality index for each day
  const indices: Record<number, number> = {}
  for (let i = 0; i < 7; i++) {
    indices[i] = overallAverage > 0 ? dayAverages[i] / overallAverage : 1
  }
  
  return indices
}

/**
 * Calculate Weighted Moving Average
 * More recent data points have higher weights
 */
function calculateWeightedMovingAverage(values: number[], weights?: number[]): number {
  if (values.length === 0) return 0
  
  // Default weights: more recent = higher weight
  const defaultWeights = values.map((_, i) => i + 1)
  const w = weights || defaultWeights
  
  const weightedSum = values.reduce((sum, val, i) => sum + val * w[i], 0)
  const weightTotal = w.reduce((sum, weight) => sum + weight, 0)
  
  return weightedSum / weightTotal
}

/**
 * Calculate trend coefficient using linear regression
 * Returns the daily change rate
 */
function calculateTrend(history: DailySalesData[]): number {
  if (history.length < 2) return 0
  
  const n = history.length
  const x = history.map((_, i) => i)
  const y = history.map(d => d.sales)
  
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  
  return slope
}

/**
 * Calculate standard deviation for confidence intervals
 */
function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

/**
 * Generate sales forecast using Weighted Moving Average with Seasonality
 * 
 * Method:
 * 1. Calculate base forecast using Weighted Moving Average of last 14 days
 * 2. Apply day-of-week seasonality indices
 * 3. Add trend adjustment based on recent performance
 * 4. Calculate confidence intervals based on historical variance
 */
export function generateSalesForecast(
  historicalDays: number = 14,
  forecastDays: number = 7
): ForecastResult[] {
  const history = getDailySalesHistory(historicalDays)
  const seasonalityIndices = calculateSeasonalityIndices(history)
  const trend = calculateTrend(history)
  const stdDev = calculateStdDev(history.map(d => d.sales))
  
  // Calculate deseasonalized values for WMA
  const deseasonalized = history.map(d => 
    seasonalityIndices[d.dayOfWeek] > 0 ? d.sales / seasonalityIndices[d.dayOfWeek] : d.sales
  )
  
  // Base forecast using WMA of deseasonalized values
  const baseWMA = calculateWeightedMovingAverage(deseasonalized)
  
  const result: ForecastResult[] = []
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Add historical data
  history.forEach(day => {
    result.push({
      date: `${months[day.date.getMonth()]} ${day.date.getDate()}`,
      fullDate: day.date,
      actual: day.sales,
      forecast: null,
      isForecast: false,
    })
  })
  
  // Generate forecasts
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 1; i <= forecastDays; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(forecastDate.getDate() + i)
    
    const dayOfWeek = forecastDate.getDay()
    const seasonalIndex = seasonalityIndices[dayOfWeek]
    
    // Forecast = (Base WMA × Seasonality Index) + (Trend × Days Ahead)
    const forecastValue = (baseWMA * seasonalIndex) + (trend * i)
    
    // Ensure forecast is not negative
    const finalForecast = Math.max(0, forecastValue)
    
    // Confidence interval (±1.5 standard deviations, widening with forecast horizon)
    const confidenceWidth = stdDev * 1.5 * (1 + i * 0.1)
    
    result.push({
      date: `${months[forecastDate.getMonth()]} ${forecastDate.getDate()}`,
      fullDate: forecastDate,
      actual: null,
      forecast: finalForecast,
      isForecast: true,
      confidence: {
        lower: Math.max(0, finalForecast - confidenceWidth),
        upper: finalForecast + confidenceWidth,
      },
    })
  }
  
  return result
}

/**
 * Calculate 7-day projection summary
 */
export function get7DayProjection(): {
  projection: number
  lastWeekActual: number
  changePercent: number
  dailyForecasts: { date: string; amount: number }[]
} {
  const forecast = generateSalesForecast(14, 7)
  
  // Sum forecasted days
  const forecastDays = forecast.filter(d => d.isForecast)
  const projection = forecastDays.reduce((sum, d) => sum + (d.forecast || 0), 0)
  
  // Sum last 7 actual days
  const actualDays = forecast.filter(d => !d.isForecast).slice(-7)
  const lastWeekActual = actualDays.reduce((sum, d) => sum + (d.actual || 0), 0)
  
  // Calculate change
  const changePercent = lastWeekActual > 0 
    ? ((projection - lastWeekActual) / lastWeekActual) * 100 
    : 0
  
  return {
    projection,
    lastWeekActual,
    changePercent,
    dailyForecasts: forecastDays.map(d => ({ date: d.date, amount: d.forecast || 0 })),
  }
}

/**
 * Calculate average daily sales for a specific product based on historical data
 */
export function getProductDailySalesVelocity(productId: string, days: number = 14): number {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)
  
  const transactions = mockTransactions.filter(tx => {
    const txDate = new Date(tx.createdAt)
    return txDate >= startDate && txDate <= now
  })
  
  let totalQuantity = 0
  transactions.forEach(tx => {
    tx.items.forEach(item => {
      if (item.productId === productId) {
        totalQuantity += item.quantity
      }
    })
  })
  
  return totalQuantity / days
}
