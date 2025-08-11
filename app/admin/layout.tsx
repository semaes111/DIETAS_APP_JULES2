'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Upload, Users, Settings, ArrowLeft } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check if user has admin privileges
    setIsAdmin(session.user.isAdmin || false)
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to access this area.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">Administration Panel</h1>
                <p className="text-sm text-muted-foreground">DIETAS-APP Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Button>
              </Link>
              <div className="text-sm">
                <p className="font-medium">{session.user?.name}</p>
                <p className="text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            <Link
              href="/admin/import"
              className="flex items-center gap-2 py-4 text-sm font-medium border-b-2 border-blue-600 text-blue-600"
            >
              <Upload className="h-4 w-4" />
              Data Import
            </Link>
            
            {/* Future admin sections can be added here */}
            <div className="flex items-center gap-2 py-4 text-sm font-medium text-muted-foreground cursor-not-allowed">
              <Users className="h-4 w-4" />
              User Management (Coming Soon)
            </div>
            
            <div className="flex items-center gap-2 py-4 text-sm font-medium text-muted-foreground cursor-not-allowed">
              <Settings className="h-4 w-4" />
              System Settings (Coming Soon)
            </div>
          </nav>
        </div>
      </div>

      {/* Admin Content */}
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}