'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Lock, Shield } from 'lucide-react'
import { validateUser } from '@/lib/mock-data/users'

export default function StaffLoginPage() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    // Pre-validate to check if user is staff
    const user = validateUser(email, password)
    if (user && user.role === 'customer') {
      setError('This login is for staff only. Please use the customer login.')
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
  }

  // Demo accounts for testing
  const demoAccounts = [
    { email: 'admin@mystore.com', password: 'admin123', role: 'Admin', description: 'Full system access' },
    { email: 'cashier@mystore.com', password: 'cashier123', role: 'Cashier', description: 'POS & transactions' },
    { email: 'stock@mystore.com', password: 'stock123', role: 'Stockman', description: 'Inventory management' },
  ]

  const fillDemoAccount = (account: typeof demoAccounts[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Shield className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Staff Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              My Store Management System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Staff Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@mystore.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    className="h-11 rounded-xl"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-11 rounded-xl"
                  />
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full h-11 rounded-xl" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">
              Click to auto-fill credentials for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto py-2.5 px-3 rounded-xl"
                onClick={() => fillDemoAccount(account)}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{account.role}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {account.description}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {account.email}
                  </span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} My Store. Authorized personnel only.
        </p>
      </div>
    </div>
  )
}
