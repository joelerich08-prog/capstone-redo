"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { StockmanSidebar } from "@/components/layout/stockman-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { Spinner } from "@/components/ui/spinner"

export default function StockmanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    } else if (!isLoading && user && user.role !== 'stockman' && user.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!isAuthenticated || (user?.role !== 'stockman' && user?.role !== 'admin')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <SettingsProvider>
      <SidebarProvider>
        <StockmanSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </SettingsProvider>
  )
}
