'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Heart, 
  User, 
  Activity, 
  Target, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Scale,
  Ruler,
  Calendar
} from 'lucide-react'

interface OnboardingData {
  age: number | null
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null
  height: number | null
  weight: number | null
  activityLevel: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE'
  goal: 'LOSE' | 'MAINTAIN' | 'GAIN'
}

const steps = [
  { id: 1, title: 'Información Personal', description: 'Datos básicos para personalizar tu experiencia' },
  { id: 2, title: 'Medidas Corporales', description: 'Altura y peso para cálculos precisos' },
  { id: 3, title: 'Nivel de Actividad', description: 'Tu rutina de ejercicio habitual' },
  { id: 4, title: 'Objetivos', description: 'Define tu meta nutricional' },
]

const activityLevels = [
  {
    value: 'SEDENTARY',
    title: 'Sedentario',
    description: 'Poco o nada de ejercicio',
    multiplier: '1.2x'
  },
  {
    value: 'LIGHTLY_ACTIVE',
    title: 'Ligeramente Activo',
    description: 'Ejercicio ligero 1-3 días/semana',
    multiplier: '1.375x'
  },
  {
    value: 'MODERATELY_ACTIVE',
    title: 'Moderadamente Activo',
    description: 'Ejercicio moderado 3-5 días/semana',
    multiplier: '1.55x'
  },
  {
    value: 'VERY_ACTIVE',
    title: 'Muy Activo',
    description: 'Ejercicio intenso 6-7 días/semana',
    multiplier: '1.725x'
  },
  {
    value: 'EXTREMELY_ACTIVE',
    title: 'Extremadamente Activo',
    description: 'Ejercicio muy intenso, trabajo físico',
    multiplier: '1.9x'
  }
]

const goals = [
  {
    value: 'LOSE',
    title: 'Perder Peso',
    description: 'Reducir peso corporal de forma saludable',
    icon: '📉',
    color: 'bg-red-50 border-red-200 hover:bg-red-100'
  },
  {
    value: 'MAINTAIN',
    title: 'Mantener Peso',
    description: 'Conservar el peso actual y mejorar composición',
    icon: '⚖️',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    value: 'GAIN',
    title: 'Ganar Peso',
    description: 'Aumentar masa muscular y peso saludable',
    icon: '📈',
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OnboardingData>({
    age: null,
    gender: null,
    height: null,
    weight: null,
    activityLevel: 'SEDENTARY',
    goal: 'MAINTAIN'
  })

  const router = useRouter()
  const supabase = createClientComponentClient()

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const calculateNutritionTargets = (data: OnboardingData) => {
    if (!data.age || !data.height || !data.weight) return null

    // Mifflin-St Jeor Equation
    let bmr = 0
    if (data.gender === 'MALE') {
      bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
    } else {
      bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age)
    }

    // Activity Level Multiplier
    const multipliers = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTREMELY_ACTIVE: 1.9
    }

    const tdee = bmr * multipliers[data.activityLevel]
    
    // Adjust calories based on goal
    let targetCalories = tdee
    if (data.goal === 'LOSE') {
      targetCalories = tdee - 500 // 500 calorie deficit
    } else if (data.goal === 'GAIN') {
      targetCalories = tdee + 300 // 300 calorie surplus
    }

    // Macronutrient distribution (Mediterranean style)
    const proteinCalories = targetCalories * 0.20 // 20% protein
    const fatCalories = targetCalories * 0.35 // 35% fat (healthy fats)
    const carbCalories = targetCalories * 0.45 // 45% carbs

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      targetProtein: Math.round(proteinCalories / 4), // 4 cal/g
      targetFat: Math.round(fatCalories / 9), // 9 cal/g
      targetCarbs: Math.round(carbCalories / 4) // 4 cal/g
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('No hay sesión activa')
        return
      }

      const nutritionTargets = calculateNutritionTargets(data)
      if (!nutritionTargets) {
        setError('Error al calcular objetivos nutricionales')
        return
      }

      // First, create user record
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
        })

      if (userError) {
        console.error('Error creating user:', userError)
        setError('Error al crear usuario')
        return
      }

      // Then create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: session.user.id,
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
          activity_level: data.activityLevel,
          goal: data.goal,
          ...nutritionTargets
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        setError('Error al crear perfil')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return data.age && data.gender
      case 2:
        return data.height && data.weight
      case 3:
        return data.activityLevel
      case 4:
        return data.goal
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Configuración Inicial
            </h1>
          </div>
          <p className="text-gray-600">
            Personaliza tu experiencia nutricional en {steps.length} simples pasos
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Paso {currentStep} de {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% completado
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center space-y-2 ${
                step.id <= currentStep ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : step.id === currentStep
                    ? 'bg-green-100 text-green-600 border-2 border-green-500'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className="text-xs text-center max-w-20">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentStep === 1 && <User className="h-5 w-5 mr-2 text-green-600" />}
              {currentStep === 2 && <Scale className="h-5 w-5 mr-2 text-blue-600" />}
              {currentStep === 3 && <Activity className="h-5 w-5 mr-2 text-purple-600" />}
              {currentStep === 4 && <Target className="h-5 w-5 mr-2 text-orange-600" />}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Edad</Label>
                    <div className="relative">
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={data.age || ''}
                        onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || null })}
                        className="pl-10"
                      />
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Género</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'MALE', label: 'Masculino', icon: '♂️' },
                      { value: 'FEMALE', label: 'Femenino', icon: '♀️' },
                      { value: 'OTHER', label: 'Otro', icon: '⚧️' }
                    ].map((gender) => (
                      <button
                        key={gender.value}
                        type="button"
                        onClick={() => setData({ ...data, gender: gender.value as any })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          data.gender === gender.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{gender.icon}</div>
                        <div className="text-sm font-medium">{gender.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Body Measurements */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <div className="relative">
                      <Input
                        id="height"
                        type="number"
                        placeholder="170"
                        value={data.height || ''}
                        onChange={(e) => setData({ ...data, height: parseFloat(e.target.value) || null })}
                        className="pl-10"
                      />
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <div className="relative">
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        value={data.weight || ''}
                        onChange={(e) => setData({ ...data, weight: parseFloat(e.target.value) || null })}
                        className="pl-10"
                      />
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* BMI Calculator */}
                {data.height && data.weight && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700">Tu IMC:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {((data.weight / ((data.height / 100) ** 2))).toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Índice de Masa Corporal calculado automáticamente
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Activity Level */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {activityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setData({ ...data, activityLevel: level.value as any })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      data.activityLevel === level.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{level.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {level.multiplier}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Goals */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => setData({ ...data, goal: goal.value as any })}
                    className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                      data.goal === goal.value
                        ? 'border-green-500 bg-green-50'
                        : `border-gray-200 hover:border-gray-300 ${goal.color}`
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{goal.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
                        <p className="text-gray-600 mt-1">{goal.description}</p>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Nutrition Preview */}
                {data.age && data.height && data.weight && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-gray-900 mb-3">Vista Previa Nutricional</h4>
                    {(() => {
                      const targets = calculateNutritionTargets(data)
                      if (!targets) return null
                      
                      return (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Calorías objetivo:</span>
                            <span className="font-medium ml-2">{targets.targetCalories} kcal</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Proteínas:</span>
                            <span className="font-medium ml-2">{targets.targetProtein}g</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Carbohidratos:</span>
                            <span className="font-medium ml-2">{targets.targetCarbs}g</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Grasas:</span>
                            <span className="font-medium ml-2">{targets.targetFat}g</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <span>Siguiente</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Configurando...</span>
                </>
              ) : (
                <>
                  <span>Completar Configuración</span>
                  <CheckCircle className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}