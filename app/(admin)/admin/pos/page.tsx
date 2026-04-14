'use client'

import { DashboardShell } from '@/components/layout/dashboard-shell'
import { POSTerminal } from '@/components/pos/pos-terminal'

export default function POSPage() {
  return (
    <DashboardShell
      title="Point of Sale"
      description="Process sales transactions"
      allowedRoles={['admin', 'cashier']}
    >
      <POSTerminal />
    </DashboardShell>
  )
}
