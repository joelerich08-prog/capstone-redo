"use client"

import Link from "next/link"
import { CustomerHeader } from "@/components/layout/customer-header"
import { InventoryProvider } from "@/contexts/inventory-context"
import { Store } from "lucide-react"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <InventoryProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <CustomerHeader />
        <main className="flex-1">{children}</main>
      
      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">Store</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/shop" className="hover:text-foreground transition-colors">
                Shop
              </Link>
              <Link href="/shop/orders" className="hover:text-foreground transition-colors">
                Orders
              </Link>
              <Link href="/shop/cart" className="hover:text-foreground transition-colors">
                Cart
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Store. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </InventoryProvider>
  )
}
