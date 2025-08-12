"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Target, 
  BarChart3, 
  Calendar, 
  ShoppingCart, 
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  Shield,
  Zap,
  Globe
} from "lucide-react"

const features = [
  {
    icon: Target,
    title: "Planes Personalizados",
    description: "Cálculo automático de calorías y macronutrientes basado en tus objetivos y características",
    color: "bg-green-500",
    gradient: "from-green-400 to-emerald-600"
  },
  {
    icon: Calendar,
    title: "Planificación Semanal",
    description: "Organiza tus comidas por semana con nuestro calendario intuitivo y fácil de usar",
    color: "bg-blue-500",
    gradient: "from-blue-400 to-cyan-600"
  },
  {
    icon: ShoppingCart,
    title: "Lista de Compras",
    description: "Genera automáticamente listas de compras basadas en tus planes de comidas",
    color: "bg-purple-500",
    gradient: "from-purple-400 to-pink-600"
  },
  {
    icon: BarChart3,
    title: "Análisis Avanzado",
    description: "Monitorea tu peso, medidas y progreso nutricional con gráficos detallados e interactivos",
    color: "bg-orange-500",
    gradient: "from-orange-400 to-red-600"
  },
  {
    icon: Heart,
    title: "Dieta Mediterránea",
    description: "Basado en los principios de la dieta mediterránea, reconocida mundialmente por sus beneficios",
    color: "bg-red-500",
    gradient: "from-red-400 to-rose-600"
  },
  {
    icon: Users,
    title: "Base de Datos Rica",
    description: "Amplia base de datos nutricionales con miles de alimentos mediterráneos y sus propiedades",
    color: "bg-indigo-500",
    gradient: "from-indigo-400 to-purple-600"
  }
]

const benefits = [
  {
    icon: CheckCircle,
    title: "Científicamente Respaldado",
    description: "Basado en investigación nutricional y principios mediterráneos validados",
    color: "text-green-600"
  },
  {
    icon: Star,
    title: "Fácil de Usar",
    description: "Interfaz intuitiva y amigable diseñada para todos los niveles de experiencia",
    color: "text-yellow-600"
  },
  {
    icon: Target,
    title: "Resultados Reales",
    description: "Alcanza tus objetivos con planes personalizados y efectivos respaldados por datos",
    color: "text-blue-600"
  },
  {
    icon: Heart,
    title: "Salud Integral",
    description: "Enfoque holístico para tu bienestar físico, mental y calidad de vida",
    color: "text-red-600"
  }
]

const stats = [
  { value: "10,000+", label: "Usuarios Activos", icon: Users },
  { value: "95%", label: "Satisfacción", icon: Star },
  { value: "500+", label: "Recetas", icon: Heart },
  { value: "24/7", label: "Soporte", icon: Shield }
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Dietas NutriMed
              </h1>
              <p className="text-xs text-gray-500">Powered by Mediterranean Science</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:bg-green-50">
              <Link href="/auth/signin">Iniciar Sesión</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-md">
              <Link href="/auth/signup">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 bg-green-100 text-green-700 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Nuevo: Análisis con IA integrado
          </Badge>
          
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Tu Compañero Nutricional
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Basado en la Dieta Mediterránea
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transforma tu alimentación con nuestro sistema inteligente de gestión nutricional. 
            Planifica, rastrea y alcanza tus objetivos de salud con la sabiduría milenaria mediterránea 
            y la tecnología más avanzada.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <Link href="/auth/signup">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 hover:bg-gray-50 transition-all duration-300">
              Ver Demo Interactiva
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-4 bg-white relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
              Características
            </Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que Necesitas para Triunfar
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una suite completa de herramientas diseñadas para revolucionar tu relación con la alimentación
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-2 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${feature.gradient} opacity-10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500`} />
                  
                  <CardHeader className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2 group-hover:text-green-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              <Award className="h-4 w-4 mr-2" />
              Ventajas Exclusivas
            </Badge>
            <h3 className="text-4xl font-bold mb-4">
              ¿Por qué elegir Dietas NutriMed?
            </h3>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              La combinación perfecta entre ciencia, tecnología y tradición mediterránea
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3 group-hover:text-green-200 transition-colors">
                    {benefit.title}
                  </h4>
                  <p className="text-green-100 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white relative">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 px-4 py-2">
              <TrendingUp className="h-4 w-4 mr-2" />
              Únete a la Revolución Nutricional
            </Badge>
            
            <h3 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Comienza tu Transformación
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Hoy Mismo
              </span>
            </h3>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a miles de personas que ya han mejorado su salud y bienestar con Dietas NutriMed. 
              Tu nueva vida saludable está a un clic de distancia.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link href="/auth/signup">
                  Empezar Gratis Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-2">
                Hablar con un Experto
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              ✓ Sin compromisos  ✓ Cancela cuando quieras  ✓ Soporte 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Dietas NutriMed
                </span>
                <p className="text-xs text-gray-400">Revolución nutricional</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Disponible globalmente
              </span>
              <span>© 2024 Dietas NutriMed</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}