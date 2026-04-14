"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CashierSidebar } from "@/components/layout/cashier-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { Spinner } from "@/components/ui/spinner"

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    } else if (!isLoading && user && user.role !== 'cashier' && user.role !== 'admin') {
      // Redirect non-cashier users to their appropriate dashboard
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, user, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  // Don't render content if not authenticated or wrong role
  if (!isAuthenticated || (user?.role !== 'cashier' && user?.role !== 'admin')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <SettingsProvider>
      <SidebarProvider>
        <CashierSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </SettingsProvider>
  )
}
