import { Metadata } from "next"
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { LandingPage } from '@/components/landing-page'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: "Bienvenido a Dietas NutriMed",
  description: "Tu compañero personal para una alimentación saludable basada en principios mediterráneos",
}

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user is authenticated and has profile
  if (session) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        redirect('/dashboard')
      } else {
        redirect('/onboarding')
      }
    } catch (error) {
      // Profile table might not exist, show setup message
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            <Alert className="border-yellow-200 bg-yellow-50 mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-800">
                <strong>Configuración Requerida:</strong> Las tablas de la base de datos necesitan ser configuradas.
              </AlertDescription>
            </Alert>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <Database className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Configuración de Base de Datos Necesaria
              </h1>
              <p className="text-gray-600 mb-6">
                Para usar NutriMed, primero necesitas configurar las tablas de Supabase.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/setup-database">
                  Configurar Base de Datos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }

  return <LandingPage />
}