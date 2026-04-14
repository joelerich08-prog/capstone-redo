'use client'

import { DashboardHeader } from '@/components/layout/dashboard-header'

interface CashierShellProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function CashierShell({
  children,
  title,
  description,
}: CashierShellProps) {
  return (
    <>
      <DashboardHeader title={title} description={description} />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {children}
        </div>
      </main>
    </>
  )
}
