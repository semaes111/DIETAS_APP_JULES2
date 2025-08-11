"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Heart, 
  Target, 
  BarChart3, 
  Calendar, 
  ShoppingCart, 
  Users,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Dietas NutriMed</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Tu Compañero Nutricional
            <span className="block text-green-600">Basado en la Dieta Mediterránea</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Planifica tu alimentación, alcanza tus objetivos de salud y disfruta de una vida más saludable 
            con nuestro sistema personalizado de gestión nutricional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth/signup">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tu alimentación y alcanzar tus objetivos de salud
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Planes Personalizados</CardTitle>
                <CardDescription>
                  Cálculo automático de calorías y macronutrientes basado en tus objetivos y características
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Planificación Semanal</CardTitle>
                <CardDescription>
                  Organiza tus comidas por semana con nuestro calendario intuitivo y fácil de usar
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Lista de Compras</CardTitle>
                <CardDescription>
                  Genera automáticamente listas de compras basadas en tus planes de comidas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Seguimiento de Progreso</CardTitle>
                <CardDescription>
                  Monitorea tu peso, medidas y progreso nutricional con gráficos detallados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Dieta Mediterránea</CardTitle>
                <CardDescription>
                  Basado en los principios de la dieta mediterránea, reconocida mundialmente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Base de Datos de Alimentos</CardTitle>
                <CardDescription>
                  Amplia base de datos nutricionales con miles de alimentos y sus propiedades
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">
              ¿Por qué elegir Dietas NutriMed?
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-200" />
              <h4 className="text-xl font-semibold mb-2">Científicamente Respaldado</h4>
              <p className="text-green-100">
                Basado en investigación nutricional y principios mediterráneos
              </p>
            </div>

            <div>
              <Star className="h-16 w-16 mx-auto mb-4 text-yellow-200" />
              <h4 className="text-xl font-semibold mb-2">Fácil de Usar</h4>
              <p className="text-green-100">
                Interfaz intuitiva y amigable para todos los niveles
              </p>
            </div>

            <div>
              <Target className="h-16 w-16 mx-auto mb-4 text-blue-200" />
              <h4 className="text-xl font-semibold mb-2">Resultados Reales</h4>
              <p className="text-green-100">
                Alcanza tus objetivos con planes personalizados y efectivos
              </p>
            </div>

            <div>
              <Heart className="h-16 w-16 mx-auto mb-4 text-red-200" />
              <h4 className="text-xl font-semibold mb-2">Salud Integral</h4>
              <p className="text-green-100">
                Enfoque holístico para tu bienestar y calidad de vida
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Comienza tu Transformación Hoy
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de personas que ya han mejorado su salud y bienestar con Dietas NutriMed
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/auth/signup">
              Registrarse Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6 text-green-600" />
            <span className="text-lg font-semibold text-gray-900">Dietas NutriMed</span>
          </div>
          <p className="text-gray-600">
            © 2024 Dietas NutriMed. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}