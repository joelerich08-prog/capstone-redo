"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Package,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Truck,
  Activity,
  ShoppingBag,
  FolderOpen,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const stockmanNavItems = [
  {
    title: "Dashboard",
    href: "/stockman/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    icon: Package,
    children: [
      {
        title: "Stock Levels",
        href: "/stockman/stock-levels",
      },
      {
        title: "Expiry",
        href: "/stockman/expiry",
      },
      {
        title: "Receive Stock",
        href: "/stockman/receiving",
      },
      {
        title: "Breakdown",
        href: "/stockman/breakdown",
      },
      {
        title: "Transfer",
        href: "/stockman/transfer",
      },
      {
        title: "Adjustments",
        href: "/stockman/adjustments",
      },
      {
        title: "Movements",
        href: "/stockman/movements",
      },
    ],
  },
  {
    title: "Products",
    href: "/stockman/products",
    icon: ShoppingBag,
  },
  {
    title: "Categories",
    href: "/stockman/categories",
    icon: FolderOpen,
  },
  {
    title: "Suppliers",
    href: "/stockman/suppliers",
    icon: Truck,
  },
  {
    title: "Activity Log",
    href: "/stockman/activity",
    icon: Activity,
  },
]

export function StockmanSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string, isSubItem: boolean = false) => {
    if (href === pathname) return true
    if (isSubItem) return false
    if (pathname.startsWith(href + '/')) return true
    return false
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/stockman/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">My Store</span>
            <span className="text-xs text-muted-foreground">Stockman Portal</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {stockmanNavItems.map((item) => {
                if (item.children && item.children.length > 0) {
                  const isParentActive = item.children.some(child => pathname.startsWith(child.href))
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={isParentActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            {item.icon && <item.icon className="size-4" />}
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive(child.href, true)}
                                >
                                  <Link href={child.href}>{child.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href!)}>
                      <Link href={item.href!}>
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user ? getInitials(user.name) : "SM"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {user?.name || "Stockman"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.email || "stockman@mystore.com"}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 size-4" />
                      Sign out
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign out</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to sign out? You will need to log in again to access the portal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={logout}>
                        Sign out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
