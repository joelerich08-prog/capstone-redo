import type { User, UserRole } from '@/lib/types'
import { isValidPhoneNumber, isValidEmail, isValidPassword, isValidName } from '@/lib/utils/validation'

// Extended User type for management with status and phone
export interface ExtendedUser extends Omit<User, 'password'> {
  phone?: string
  status: 'active' | 'inactive'
}

export const mockUsers: ExtendedUser[] = [
  {
    id: 'usr_001',
    email: 'admin@mystore.com',
    name: 'Admin User',
    role: 'admin',
    avatar: undefined,
    phone: '+63 917 123 4567',
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: 'usr_002',
    email: 'stock@mystore.com',
    name: 'Juan Dela Cruz',
    role: 'stockman',
    avatar: undefined,
    phone: '+63 918 234 5678',
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date(),
  },
  {
    id: 'usr_003',
    email: 'cashier@mystore.com',
    name: 'Maria Santos',
    role: 'cashier',
    avatar: undefined,
    phone: '+63 919 345 6789',
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-02-01'),
    lastLogin: new Date(),
  },
  {
    id: 'usr_004',
    email: 'cashier2@mystore.com',
    name: 'Ana Garcia',
    role: 'cashier',
    phone: '+63 920 456 7890',
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-02-15'),
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'usr_005',
    email: 'stock2@mystore.com',
    name: 'Carlos Mendoza',
    role: 'stockman',
    phone: '+63 921 567 8901',
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-03-01'),
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'usr_006',
    email: 'customer@email.com',
    name: 'Pedro Reyes',
    role: 'customer',
    phone: '+63 922 678 9012',
    isActive: true,
    status: 'active',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'usr_007',
    email: 'inactive@mystore.com',
    name: 'Former Employee',
    role: 'cashier',
    isActive: false,
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
  },
]

// Auth credentials (separate for security)
const userCredentials: Record<string, string> = {
  'admin@mystore.com': 'admin123',
  'stock@mystore.com': 'stock123',
  'cashier@mystore.com': 'cashier123',
  'customer@email.com': 'customer123',
}

export function findUserByEmail(email: string): ExtendedUser | undefined {
  return mockUsers.find(user => user.email === email)
}

export function validateUser(email: string, password: string): ExtendedUser | null {
  const user = findUserByEmail(email)
  const storedPassword = userCredentials[email]
  if (user && storedPassword === password && user.isActive) {
    return user
  }
  return null
}

export interface RegisterUserData {
  email: string
  password: string
  name: string
  phone?: string
}

export interface RegisterResult {
  success: boolean
  user?: ExtendedUser
  error?: string
}

export function registerUser(data: RegisterUserData): RegisterResult {
  // Validate email format
  if (!isValidEmail(data.email)) {
    return { success: false, error: 'Invalid email format' }
  }

  // Check if email already exists
  const existingUser = findUserByEmail(data.email)
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' }
  }

  // Validate password
  const passwordValidation = isValidPassword(data.password)
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error }
  }

  // Validate name
  const nameValidation = isValidName(data.name)
  if (!nameValidation.valid) {
    return { success: false, error: nameValidation.error || 'Please enter a valid name' }
  }

  // Validate phone if provided (Philippine format)
  if (data.phone) {
    const cleanPhone = data.phone.replace(/[\s\-()]/g, '')
    if (!isValidPhoneNumber(cleanPhone)) {
      return { success: false, error: 'Invalid phone number format (use 09XX or +639XX)' }
    }
  }

  // Create new user
  const newUser: ExtendedUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
    role: 'customer',
    phone: data.phone,
    isActive: true,
    status: 'active',
    createdAt: new Date(),
  }

  // Add to mock data (in production, this would be a database insert)
  mockUsers.push(newUser)
  userCredentials[newUser.email] = data.password

  return { success: true, user: newUser }
}

// Activity Log Mock Data
export interface ActivityLogEntry {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  action: string
  module: string
  details: string
  ipAddress: string
  timestamp: Date
}

export const mockActivityLog: ActivityLogEntry[] = [
  {
    id: 'log_001',
    userId: 'usr_001',
    userName: 'Admin User',
    userRole: 'admin',
    action: 'login',
    module: 'auth',
    details: 'Successful login',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'log_002',
    userId: 'usr_003',
    userName: 'Maria Santos',
    userRole: 'cashier',
    action: 'create',
    module: 'pos',
    details: 'Completed transaction #TXN-2024-001 - Total: P1,250.00',
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'log_003',
    userId: 'usr_002',
    userName: 'Juan Dela Cruz',
    userRole: 'stockman',
    action: 'update',
    module: 'inventory',
    details: 'Received 50 boxes of Lucky Me Pancit Canton from ABC Distributors',
    ipAddress: '192.168.1.102',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'log_004',
    userId: 'usr_001',
    userName: 'Admin User',
    userRole: 'admin',
    action: 'update',
    module: 'users',
    details: 'Updated user permissions for Maria Santos',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'log_005',
    userId: 'usr_002',
    userName: 'Juan Dela Cruz',
    userRole: 'stockman',
    action: 'create',
    module: 'inventory',
    details: 'Broke down 10 wholesale boxes to 120 retail packs - Argentina Corned Beef',
    ipAddress: '192.168.1.102',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'log_006',
    userId: 'usr_004',
    userName: 'Ana Garcia',
    userRole: 'cashier',
    action: 'create',
    module: 'pos',
    details: 'Completed transaction #TXN-2024-002 - Total: P680.00',
    ipAddress: '192.168.1.103',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: 'log_007',
    userId: 'usr_001',
    userName: 'Admin User',
    userRole: 'admin',
    action: 'delete',
    module: 'inventory',
    details: 'Removed expired product: Eden Cheese 165g (5 units)',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: 'log_008',
    userId: 'usr_005',
    userName: 'Carlos Mendoza',
    userRole: 'stockman',
    action: 'update',
    module: 'inventory',
    details: 'Transferred 200 units from wholesale to retail tier',
    ipAddress: '192.168.1.104',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    id: 'log_009',
    userId: 'usr_001',
    userName: 'Admin User',
    userRole: 'admin',
    action: 'update',
    module: 'settings',
    details: 'Updated store business hours',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 'log_010',
    userId: 'usr_003',
    userName: 'Maria Santos',
    userRole: 'cashier',
    action: 'update',
    module: 'pos',
    details: 'Processed refund for transaction #TXN-2024-000 - P450.00',
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
]
