"use client"

import { POSTerminal } from "@/components/pos/pos-terminal"
import { CashierShell } from "@/components/layout/cashier-shell"

export default function CashierPOSPage() {
  return (
    <CashierShell title="POS Terminal" description="Process sales transactions">
      <POSTerminal />
    </CashierShell>
  )
}
