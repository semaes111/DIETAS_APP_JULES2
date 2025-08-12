'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminImportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Import Administration</h1>
        <p className="text-gray-600 mt-2">
          Import functionality will be available soon. Please check back later.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Coming Soon</h2>
        <p className="text-blue-700">
          The data import functionality is currently being optimized for production deployment. 
          This feature will be available in the next update.
        </p>
      </div>
    </div>
  )
}