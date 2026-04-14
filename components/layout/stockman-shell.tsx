'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'

interface StockmanShellProps {
  children: React.ReactNode
  title: string
  description?: string
  headerAction?: React.ReactNode
}

export function StockmanShell({
  children,
  title,
  description,
  headerAction,
}: StockmanShellProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user && user.role !== 'stockman') {
        // Redirect non-stockman users
        if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (user.role === 'cashier') {
          router.push('/cashier/pos')
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or wrong role
  if (!isAuthenticated || !user || user.role !== 'stockman') {
    return null
  }

  return (
    <>
      <DashboardHeader title={title} description={description} headerAction={headerAction} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {children}
        </div>
      </main>
    </>
  )
}
