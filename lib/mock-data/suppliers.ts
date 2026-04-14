import type { Supplier } from '@/lib/types'

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup_001',
    name: 'Metro Distributors Inc.',
    contactPerson: 'Roberto Cruz',
    phone: '+63 917 123 4567',
    email: 'sales@metrodist.com.ph',
    address: '123 EDSA, Quezon City',
    isActive: true,
  },
  {
    id: 'sup_002',
    name: 'Golden Harvest Trading',
    contactPerson: 'Elena Garcia',
    phone: '+63 918 234 5678',
    email: 'orders@goldenharvest.ph',
    address: '456 Commonwealth Ave, Quezon City',
    isActive: true,
  },
  {
    id: 'sup_003',
    name: 'Pinoy Foods Corporation',
    contactPerson: 'Mario Reyes',
    phone: '+63 919 345 6789',
    email: 'supply@pinoyfoods.com',
    address: '789 Shaw Blvd, Mandaluyong',
    isActive: true,
  },
  {
    id: 'sup_004',
    name: 'Clean & Fresh Supplies',
    contactPerson: 'Anna Lim',
    phone: '+63 920 456 7890',
    email: 'contact@cleanfresh.ph',
    address: '321 Ortigas Ave, Pasig',
    isActive: true,
  },
  {
    id: 'sup_005',
    name: 'Pacific Beverage Co.',
    contactPerson: 'Carlos Santos',
    phone: '+63 921 567 8901',
    email: 'orders@pacificbev.com.ph',
    address: '654 Makati Ave, Makati',
    isActive: true,
  },
]

export function getSupplierById(id: string): Supplier | undefined {
  return mockSuppliers.find(sup => sup.id === id)
}

export function getSupplierName(id: string): string {
  return getSupplierById(id)?.name ?? 'Unknown'
}
