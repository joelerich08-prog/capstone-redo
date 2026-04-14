"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Store, Bell, Shield, Receipt, Save } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export default function SettingsPage() {
  const { 
    settings, 
    updateStoreSettings, 
    updateNotificationSettings, 
    updatePOSSettings, 
    updateSecuritySettings,
    saveSettings 
  } = useSettings()
  
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleSave = () => {
    saveSettings()
    setShowSaveDialog(false)
    toast.success("Settings saved successfully")
  }

  return (
    <DashboardShell title="Settings" description="Manage your store configuration" allowedRoles={['admin']}>
      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] lg:grid-cols-4">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="pos" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">POS</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store that appears on receipts and reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={settings.store.name}
                    onChange={(e) => updateStoreSettings({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={settings.store.phone}
                    onChange={(e) => updateStoreSettings({ phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Email Address</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={settings.store.email}
                  onChange={(e) => updateStoreSettings({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Address</Label>
                <Textarea
                  id="storeAddress"
                  value={settings.store.address}
                  onChange={(e) => updateStoreSettings({ address: e.target.value })}
                  rows={3}
                />
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={settings.store.currency} 
                    onValueChange={(value) => updateStoreSettings({ currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">Philippine Peso (P)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.store.timezone} 
                    onValueChange={(value) => updateStoreSettings({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Manila">Asia/Manila (UTC+8)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>
                Set your store operating hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="w-24 font-medium">Open</span>
                  <Input 
                    type="time" 
                    value={settings.store.businessHours.open} 
                    onChange={(e) => updateStoreSettings({ 
                      businessHours: { ...settings.store.businessHours, open: e.target.value } 
                    })}
                    className="w-32" 
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input 
                    type="time" 
                    value={settings.store.businessHours.close} 
                    onChange={(e) => updateStoreSettings({ 
                      businessHours: { ...settings.store.businessHours, close: e.target.value } 
                    })}
                    className="w-32" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when stock is low
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.lowStockAlerts}
                  onCheckedChange={(checked) => updateNotificationSettings({ lowStockAlerts: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Expiry Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for expiring products
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.expiryAlerts}
                  onCheckedChange={(checked) => updateNotificationSettings({ expiryAlerts: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Receive daily sales summary
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.dailyReports}
                  onCheckedChange={(checked) => updateNotificationSettings({ dailyReports: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance summary
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => updateNotificationSettings({ weeklyReports: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>
                Configure stock-related notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.notifications.lowStockThreshold}
                    onChange={(e) => updateNotificationSettings({ lowStockThreshold: parseInt(e.target.value) || 10 })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">units</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alert when stock falls below this quantity
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="expiryWarningDays">Expiry Warning Days</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="expiryWarningDays"
                    type="number"
                    value={settings.notifications.expiryWarningDays}
                    onChange={(e) => updateNotificationSettings({ expiryWarningDays: parseInt(e.target.value) || 30 })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">days before expiry</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alert when products are about to expire
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pos" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>POS Settings</CardTitle>
              <CardDescription>
                Configure point-of-sale behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-print Receipt</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically print receipt after each transaction
                    </p>
                  </div>
                  <Switch 
                    checked={settings.pos.autoPrintReceipt} 
                    onCheckedChange={(checked) => updatePOSSettings({ autoPrintReceipt: checked })} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quick Add Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Single click to add items to cart
                    </p>
                  </div>
                  <Switch 
                    checked={settings.pos.quickAddMode} 
                    onCheckedChange={(checked) => updatePOSSettings({ quickAddMode: checked })} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Product Images</p>
                    <p className="text-sm text-muted-foreground">
                      Display product images in POS terminal
                    </p>
                  </div>
                  <Switch 
                    checked={settings.pos.showProductImages} 
                    onCheckedChange={(checked) => updatePOSSettings({ showProductImages: checked })} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require Customer Info</p>
                    <p className="text-sm text-muted-foreground">
                      Require customer details for each transaction
                    </p>
                  </div>
                  <Switch 
                    checked={settings.pos.requireCustomerInfo} 
                    onCheckedChange={(checked) => updatePOSSettings({ requireCustomerInfo: checked })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Enable or disable payment options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <span className="text-lg font-bold text-green-500">P</span>
                  </div>
                  <div>
                    <p className="font-medium">Cash</p>
                    <p className="text-sm text-muted-foreground">Accept cash payments</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.pos.enableCashPayment} 
                  onCheckedChange={(checked) => updatePOSSettings({ enableCashPayment: checked })} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <span className="text-sm font-bold text-blue-500">G</span>
                  </div>
                  <div>
                    <p className="font-medium">GCash</p>
                    <p className="text-sm text-muted-foreground">Accept GCash e-wallet</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.pos.enableGCashPayment} 
                  onCheckedChange={(checked) => updatePOSSettings({ enableGCashPayment: checked })} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10">
                    <span className="text-sm font-bold text-green-600">M</span>
                  </div>
                  <div>
                    <p className="font-medium">Maya</p>
                    <p className="text-sm text-muted-foreground">Accept Maya e-wallet</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.pos.enableMayaPayment} 
                  onCheckedChange={(checked) => updatePOSSettings({ enableMayaPayment: checked })} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <span className="text-sm font-bold text-purple-500">C</span>
                  </div>
                  <div>
                    <p className="font-medium">Card</p>
                    <p className="text-sm text-muted-foreground">Accept card payments</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.pos.enableCardPayment} 
                  onCheckedChange={(checked) => updatePOSSettings({ enableCardPayment: checked })} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch 
                  checked={settings.security.twoFactorEnabled} 
                  onCheckedChange={(checked) => updateSecuritySettings({ twoFactorEnabled: checked })} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-logout after inactivity
                  </p>
                </div>
                <Select 
                  value={settings.security.sessionTimeout.toString()} 
                  onValueChange={(value) => updateSecuritySettings({ sessionTimeout: parseInt(value) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Attempts</p>
                  <p className="text-sm text-muted-foreground">
                    Lock account after failed attempts
                  </p>
                </div>
                <Select 
                  value={settings.security.maxLoginAttempts.toString()} 
                  onValueChange={(value) => updateSecuritySettings({ maxLoginAttempts: parseInt(value) })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Backup and data retention settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Backup</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup data
                  </p>
                </div>
                <Switch 
                  checked={settings.security.autoBackup} 
                  onCheckedChange={(checked) => updateSecuritySettings({ autoBackup: checked })} 
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Backup Frequency</p>
                  <p className="text-sm text-muted-foreground">
                    How often to backup data
                  </p>
                </div>
                <Select 
                  value={settings.security.backupFrequency} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => updateSecuritySettings({ backupFrequency: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <Select 
                  value={settings.security.dataRetentionDays.toString()} 
                  onValueChange={(value) => updateSecuritySettings({ dataRetentionDays: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">6 months</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="730">2 years</SelectItem>
                    <SelectItem value="0">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => setShowSaveDialog(true)} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes? This will update your store configuration.
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
    </DashboardShell>
  )
}
