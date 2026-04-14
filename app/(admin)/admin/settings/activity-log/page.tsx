"use client"

import { useState, useMemo } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePickerWithRange } from "@/components/shared/date-range-picker"
import { mockActivityLog } from "@/lib/mock-data/users"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { Search, Download, Filter, LogIn, Plus, Pencil, Trash2, RefreshCw, X, ChevronLeft, ChevronRight, ArrowUpDown, Eye } from "lucide-react"
import type { UserRole } from "@/lib/types"
import type { DateRange } from "react-day-picker"

const actionIcons: Record<string, React.ReactNode> = {
  login: <LogIn className="h-4 w-4" />,
  create: <Plus className="h-4 w-4" />,
  update: <Pencil className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
}

const actionColors: Record<string, string> = {
  login: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  create: "bg-green-500/10 text-green-500 border-green-500/20",
  update: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  delete: "bg-red-500/10 text-red-500 border-red-500/20",
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  stockman: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  cashier: "bg-green-500/10 text-green-500 border-green-500/20",
  customer: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const moduleLabels: Record<string, string> = {
  auth: "Authentication",
  pos: "Point of Sale",
  inventory: "Inventory",
  users: "User Management",
  settings: "Settings",
}

type SortField = "timestamp" | "userName" | "action" | "module"
type SortDirection = "asc" | "desc"

interface ActivityLog {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  action: string
  module: string
  details: string
  ipAddress: string
  timestamp: Date
}

export default function ActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const itemsPerPage = 10

  const hasActiveFilters = searchQuery || moduleFilter !== "all" || actionFilter !== "all" || roleFilter !== "all" || dateRange

  const clearAllFilters = () => {
    setSearchQuery("")
    setModuleFilter("all")
    setActionFilter("all")
    setRoleFilter("all")
    setDateRange(undefined)
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const filteredLogs = useMemo(() => {
    let logs = mockActivityLog.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesModule = moduleFilter === "all" || log.module === moduleFilter
      const matchesAction = actionFilter === "all" || log.action === actionFilter
      const matchesRole = roleFilter === "all" || log.userRole === roleFilter
      const matchesDate = !dateRange?.from || !dateRange?.to || isWithinInterval(new Date(log.timestamp), {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      })
      return matchesSearch && matchesModule && matchesAction && matchesRole && matchesDate
    })

    // Sort logs
    logs = [...logs].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "timestamp":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case "userName":
          comparison = a.userName.localeCompare(b.userName)
          break
        case "action":
          comparison = a.action.localeCompare(b.action)
          break
        case "module":
          comparison = a.module.localeCompare(b.module)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return logs
  }, [searchQuery, moduleFilter, actionFilter, roleFilter, dateRange, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
  }

  const handleExport = () => {
    const csvContent = [
      ["Timestamp", "User", "Role", "Action", "Module", "Details", "IP Address"].join(","),
      ...filteredLogs.map((log) =>
        [
          format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
          log.userName,
          log.userRole,
          log.action,
          log.module,
          `"${log.details}"`,
          log.ipAddress,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  return (
    <DashboardShell title="Activity Log" description="Monitor system activity and user actions">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>
                {filteredLogs.length} log entries
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by user or details..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="pl-9"
                />
              </div>
              <DatePickerWithRange date={dateRange} setDate={(range) => { setDateRange(range); setCurrentPage(1) }} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="pos">Point of Sale</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="stockman">Stockman</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("timestamp")} className="-ml-3">
                      Timestamp
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("userName")} className="-ml-3">
                      User
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("action")} className="-ml-3">
                      Action
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("module")} className="-ml-3">
                      Module
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                  <TableHead className="hidden md:table-cell">IP Address</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(log as ActivityLog)}>
                    <TableCell className="whitespace-nowrap">
                      <div>
                        <p className="text-sm">{format(log.timestamp, "MMM d, yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(log.timestamp, "HH:mm:ss")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(log.userName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{log.userName}</p>
                          <Badge variant="outline" className={`text-xs ${roleColors[log.userRole]}`}>
                            {log.userRole}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionColors[log.action] || ""}>
                        <span className="mr-1">{actionIcons[log.action]}</span>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{moduleLabels[log.module] || log.module}</span>
                    </TableCell>
                    <TableCell className="hidden max-w-[300px] truncate lg:table-cell">
                      <span className="text-sm text-muted-foreground">{log.details}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-xs text-muted-foreground">{log.ipAddress}</code>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedLog(log as ActivityLog) }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Activity Log Details</DialogTitle>
            <DialogDescription>
              Full details of this activity entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(selectedLog.userName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedLog.userName}</p>
                  <Badge variant="outline" className={roleColors[selectedLog.userRole]}>
                    {selectedLog.userRole}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{format(selectedLog.timestamp, "PPpp")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <code className="font-medium">{selectedLog.ipAddress}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <Badge variant="outline" className={actionColors[selectedLog.action]}>
                    <span className="mr-1">{actionIcons[selectedLog.action]}</span>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Module</p>
                  <p className="font-medium">{moduleLabels[selectedLog.module] || selectedLog.module}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Details</p>
                <p className="mt-1 rounded-md bg-muted p-3 text-sm">{selectedLog.details}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Log ID</p>
                <code className="text-xs">{selectedLog.id}</code>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
