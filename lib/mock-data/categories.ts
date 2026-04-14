import type { Category } from '@/lib/types'

export const mockCategories: Category[] = [
  {
    id: 'cat_001',
    name: 'Canned Goods',
    description: 'Canned food items',
    isActive: true,
  },
  {
    id: 'cat_002',
    name: 'Beverages',
    description: 'Drinks and beverages',
    isActive: true,
  },
  {
    id: 'cat_003',
    name: 'Snacks',
    description: 'Chips, biscuits, and candy',
    isActive: true,
  },
  {
    id: 'cat_004',
    name: 'Personal Care',
    description: 'Soap, shampoo, toiletries',
    isActive: true,
  },
  {
    id: 'cat_005',
    name: 'Household',
    description: 'Cleaning supplies and household items',
    isActive: true,
  },
  {
    id: 'cat_006',
    name: 'Rice & Grains',
    description: 'Rice, noodles, and grains',
    isActive: true,
  },
  {
    id: 'cat_007',
    name: 'Condiments',
    description: 'Sauces, vinegar, cooking ingredients',
    isActive: true,
  },
  {
    id: 'cat_008',
    name: 'Dairy',
    description: 'Milk, cheese, and dairy products',
    isActive: true,
  },
]

export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find(cat => cat.id === id)
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? 'Unknown'
}
