'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import type { UserRole } from '@/lib/types'
import { getDefaultPath } from '@/lib/utils/permissions'

interface DashboardShellProps {
  children: React.ReactNode
  title: string
  description?: string
  allowedRoles?: UserRole[]
  headerAction?: React.ReactNode
}

export function DashboardShell({
  children,
  title,
  description,
  allowedRoles,
  headerAction,
}: DashboardShellProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.push(getDefaultPath(user.role))
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router])

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
  if (!isAuthenticated || !user) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader title={title} description={description} headerAction={headerAction} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex flex-col gap-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
