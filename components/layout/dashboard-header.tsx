'use client'

import { useRouter } from 'next/navigation'
import { Bell, Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { getUnreadAlertsCount, getRecentAlerts } from '@/lib/mock-data/alerts'
import { formatDistanceToNow } from 'date-fns'

interface DashboardHeaderProps {
  title: string
  description?: string
  headerAction?: React.ReactNode
}

export function DashboardHeader({ title, description, headerAction }: DashboardHeaderProps) {
  const router = useRouter()
  const unreadCount = getUnreadAlertsCount()
  const recentAlerts = getRecentAlerts(5)

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {headerAction && (
        <div className="flex items-center">
          {headerAction}
        </div>
      )}

      <div className="hidden md:flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-8 h-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className="flex flex-col items-start gap-1 p-3"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className={`size-2 rounded-full ${
                        alert.priority === 'critical'
                          ? 'bg-destructive'
                          : alert.priority === 'high'
                          ? 'bg-orange-500'
                          : 'bg-muted-foreground'
                      }`}
                    />
                    <span className="font-medium text-sm flex-1">
                      {alert.title}
                    </span>
                    {!alert.isRead && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground pl-4">
                    {alert.message}
                  </p>
                  <span className="text-xs text-muted-foreground pl-4">
                    {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-primary cursor-pointer"
              onClick={() => router.push('/admin/analytics/alerts')}
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
