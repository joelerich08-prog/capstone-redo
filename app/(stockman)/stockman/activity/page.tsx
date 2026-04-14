"use client"

import { useState } from "react"
import { StockmanShell } from "@/components/layout/stockman-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInventory } from "@/contexts/inventory-context"
import { Scissors, ArrowRightLeft, Boxes, Package, Search, Filter } from "lucide-react"
import { format } from "date-fns"

const getActivityIcon = (type: string) => {
  switch (type) {
    case "receiving":
      return <Boxes className="h-4 w-4" />
    case "breakdown":
      return <Scissors className="h-4 w-4" />
    case "transfer":
      return <ArrowRightLeft className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "receiving":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "breakdown":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "transfer":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}

export default function StockmanActivityPage() {
  const { activityLog } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredLog = activityLog.filter(activity => {
    const matchesSearch = 
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || activity.type === typeFilter
    return matchesSearch && matchesType
  })

  // Calculate summary stats
  const todayCount = activityLog.filter(a => {
    const today = new Date()
    return a.timestamp.toDateString() === today.toDateString()
  }).length

  const receivingCount = activityLog.filter(a => a.type === "receiving").length
  const transferCount = activityLog.filter(a => a.type === "transfer").length
  const breakdownCount = activityLog.filter(a => a.type === "breakdown").length

  return (
    <StockmanShell title="Activity Log" description="View recent inventory operations">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Activity</p>
                <p className="text-2xl font-bold">{todayCount}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receiving</p>
                <p className="text-2xl font-bold text-green-600">{receivingCount}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                <Boxes className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transfers</p>
                <p className="text-2xl font-bold text-blue-600">{transferCount}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <ArrowRightLeft className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Breakdowns</p>
                <p className="text-2xl font-bold text-orange-600">{breakdownCount}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                <Scissors className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="receiving">Receiving</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="breakdown">Breakdown</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLog.length > 0 ? (
            <div className="space-y-4">
              {filteredLog.map((activity) => (
                <div key={activity.id} className="flex gap-4 rounded-lg border p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                      </div>
                      <Badge variant="outline" className={getActivityColor(activity.type)}>
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>By {activity.user}</span>
                      <span>-</span>
                      <span>{format(activity.timestamp, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== "all" 
                  ? "No activities found matching your criteria" 
                  : "No activity yet. Start by receiving, transferring, or breaking down stock."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </StockmanShell>
  )
}
