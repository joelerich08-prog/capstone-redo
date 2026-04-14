"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Shield, Package, ShoppingCart, BarChart3, Settings, Users, Save, RotateCcw, CheckSquare, XSquare, LayoutDashboard, Truck } from "lucide-react"
import { useSettings, type UserRole, type RolePermissions, type ModulePermission } from "@/contexts/settings-context"

interface ModuleConfig {
  module: keyof RolePermissions
  icon: React.ReactNode
  label: string
  description: string
}

const moduleConfigs: ModuleConfig[] = [
  {
    module: "dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    description: "Access to dashboard and overview statistics",
  },
  {
    module: "pos",
    icon: <ShoppingCart className="h-5 w-5" />,
    label: "Point of Sale",
    description: "Transaction processing and sales",
  },
  {
    module: "inventory",
    icon: <Package className="h-5 w-5" />,
    label: "Inventory Management",
    description: "Stock levels, transfers, and adjustments",
  },
  {
    module: "products",
    icon: <Package className="h-5 w-5" />,
    label: "Products & Categories",
    description: "Product catalog management",
  },
  {
    module: "suppliers",
    icon: <Truck className="h-5 w-5" />,
    label: "Suppliers",
    description: "Supplier management and purchase orders",
  },
  {
    module: "reports",
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Reports & Analytics",
    description: "Sales reports, inventory reports, and insights",
  },
  {
    module: "users",
    icon: <Users className="h-5 w-5" />,
    label: "User Management",
    description: "User accounts and permissions",
  },
  {
    module: "settings",
    icon: <Settings className="h-5 w-5" />,
    label: "System Settings",
    description: "Store configuration and preferences",
  },
]

const actionLabels: Record<keyof ModulePermission, { label: string; description: string }> = {
  view: { label: "View", description: "Access and view data" },
  create: { label: "Create", description: "Add new records" },
  edit: { label: "Edit", description: "Modify existing records" },
  delete: { label: "Delete", description: "Remove records" },
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  manager: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  stockman: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  cashier: "bg-green-500/10 text-green-500 border-green-500/20",
}

const roles: UserRole[] = ["admin", "manager", "cashier", "stockman"]

export default function AccessControlPage() {
  const { 
    settings, 
    togglePermission, 
    toggleAllModulePermissions, 
    resetPermissionsToDefaults,
    saveSettings 
  } = useSettings()
  
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleTogglePermission = (role: UserRole, module: keyof RolePermissions, action: keyof ModulePermission) => {
    togglePermission(role, module, action)
    setHasChanges(true)
  }

  const handleToggleAllModule = (role: UserRole, module: keyof RolePermissions, enable: boolean) => {
    toggleAllModulePermissions(role, module, enable)
    setHasChanges(true)
    const moduleConfig = moduleConfigs.find(m => m.module === module)
    toast.success(`${enable ? 'Enabled' : 'Disabled'} all ${moduleConfig?.label || module} permissions for ${role}`)
  }

  const handleSave = () => {
    saveSettings()
    setShowSaveDialog(false)
    toast.success("Access control settings saved successfully")
    setHasChanges(false)
  }

  const handleReset = () => {
    resetPermissionsToDefaults()
    setShowResetDialog(false)
    setHasChanges(false)
    toast.success("Permissions reset to defaults")
  }

  const getModulePermissionCount = (role: UserRole, module: keyof RolePermissions) => {
    const perms = settings.permissions[role][module]
    const enabled = Object.values(perms).filter(Boolean).length
    return { enabled, total: 4 }
  }

  return (
    <DashboardShell title="Access Control" description="Manage role-based permissions and access levels">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {roles.map((role) => (
            <Badge key={role} variant="outline" className={roleColors[role]}>
              <Shield className="mr-1 h-3 w-3" />
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowResetDialog(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={() => setShowSaveDialog(true)} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
            {hasChanges && <span className="ml-1 text-xs">(unsaved)</span>}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="mb-4">
          {roles.map((role) => (
            <TabsTrigger key={role} value={role} className="gap-2">
              <Shield className="h-4 w-4" />
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {roles.map((role) => (
          <TabsContent key={role} value={role} className="space-y-6">
            {role === "admin" && (
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Admin role has full access to all modules and cannot be modified.
                </p>
              </div>
            )}
            
            {moduleConfigs.map((moduleConfig) => {
              const perms = settings.permissions[role][moduleConfig.module]
              const { enabled, total } = getModulePermissionCount(role, moduleConfig.module)
              
              return (
                <Card key={moduleConfig.module}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {moduleConfig.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{moduleConfig.label}</CardTitle>
                          <CardDescription>{moduleConfig.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {enabled}/{total} enabled
                        </Badge>
                        {role !== "admin" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleToggleAllModule(role, moduleConfig.module, true)}
                              title="Enable all"
                            >
                              <CheckSquare className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleToggleAllModule(role, moduleConfig.module, false)}
                              title="Disable all"
                            >
                              <XSquare className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {(Object.keys(actionLabels) as Array<keyof ModulePermission>).map((action) => {
                        const isEnabled = perms[action]
                        const isAdmin = role === "admin"
                        const actionInfo = actionLabels[action]
                        
                        return (
                          <div
                            key={action}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">{actionInfo.label}</p>
                              <p className="text-xs text-muted-foreground">{actionInfo.description}</p>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => handleTogglePermission(role, moduleConfig.module, action)}
                              disabled={isAdmin}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        ))}
      </Tabs>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Access Control Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these permission changes? This will affect what actions each role can perform in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Permissions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all permissions to their default values? This will discard all custom permission changes you have made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
              Reset Permissions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
