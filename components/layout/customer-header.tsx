"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { Store, ShoppingCart, User, LogOut, Menu, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/orders", label: "My Orders" },
]

export function CustomerHeader() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { items } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Nav */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/shop" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-sm">
              <Store className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Store</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted/50" asChild>
            <Link href="/shop/cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-muted/50">
                    <Avatar className="h-8 w-8 ring-2 ring-background">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/shop/account" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={logout} className="rounded-lg cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-xl px-4">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="rounded-xl px-4">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 rounded-xl hover:bg-muted/50">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm p-0">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-[calc(100%-80px)]">
                {/* User Info */}
                {user && (
                  <div className="p-6 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-background">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Navigation Links */}
                <nav className="flex-1 overflow-auto p-4">
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors",
                          pathname === item.href 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted/50"
                        )}
                      >
                        {item.label}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                    
                    {user && (
                      <Link
                        href="/shop/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          Account
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    )}
                  </div>
                </nav>
                
                {/* Footer Actions */}
                <div className="p-4 border-t mt-auto">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full rounded-xl h-12">
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                          Create Account
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full rounded-xl h-12">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
