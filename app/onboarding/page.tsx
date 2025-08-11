"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Heart, User, Ruler, Weight, Activity, Target } from "lucide-react"
import { calculateBMR, calculateTDEE, calculateMacros } from "@/lib/utils"

const profileSchema = z.object({
  age: z.number().min(16, "Debes tener al menos 16 años").max(120, "Edad máxima: 120 años"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  height: z.number().min(140, "Altura mínima: 140 cm").max(220, "Altura máxima: 220 cm"),
  weight: z.number().min(40, "Peso mínimo: 40 kg").max(300, "Peso máximo: 300 kg"),
  activityLevel: z.enum(["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "EXTREMELY_ACTIVE"]),
  goal: z.enum(["LOSE", "MAINTAIN", "GAIN"]),
})

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: 25,
      gender: "MALE",
      height: 170,
      weight: 70,
      activityLevel: "MODERATELY_ACTIVE",
      goal: "MAINTAIN",
    },
  })

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setLoading(true)
    try {
      // Calculate nutritional targets
      const bmr = calculateBMR(values.weight, values.height, values.age, values.gender.toLowerCase() as "male" | "female")
      const tdee = calculateTDEE(bmr, values.activityLevel.toLowerCase())
      
      let targetCalories = tdee
      if (values.goal === "LOSE") {
        targetCalories = tdee - 500 // 500 calorie deficit
      } else if (values.goal === "GAIN") {
        targetCalories = tdee + 300 // 300 calorie surplus
      }

      const macros = calculateMacros(targetCalories, values.goal.toLowerCase() as "lose" | "maintain" | "gain")

      const profileData = {
        ...values,
        bmr,
        tdee,
        targetCalories: Math.round(targetCalories),
        targetProtein: macros.protein,
        targetCarbs: macros.carbs,
        targetFat: macros.fat,
      }

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        toast({
          title: "Perfil creado",
          description: "Tu perfil nutricional ha sido configurado exitosamente",
        })
        router.push("/dashboard")
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Error al crear el perfil",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error de red. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Dietas NutriMed</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configura tu Perfil Nutricional
          </h1>
          <p className="text-gray-600">
            Necesitamos conocerte mejor para crear tu plan personalizado
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    step >= i ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Información Personal"}
              {step === 2 && "Medidas Corporales"}
              {step === 3 && "Objetivos y Actividad"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Información básica sobre ti"}
              {step === 2 && "Tus medidas actuales"}
              {step === 3 && "Tus objetivos y nivel de actividad"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Edad</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="25"
                                className="pl-10"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Género</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu género" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MALE">Masculino</SelectItem>
                              <SelectItem value="FEMALE">Femenino</SelectItem>
                              <SelectItem value="OTHER">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Altura (cm)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="170"
                                className="pl-10"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (kg)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Weight className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="70"
                                step="0.1"
                                className="pl-10"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Actividad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Selecciona tu nivel de actividad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SEDENTARY">Sedentario (poco o ningún ejercicio)</SelectItem>
                              <SelectItem value="LIGHTLY_ACTIVE">Ligeramente activo (ejercicio ligero 1-3 días/semana)</SelectItem>
                              <SelectItem value="MODERATELY_ACTIVE">Moderadamente activo (ejercicio moderado 3-5 días/semana)</SelectItem>
                              <SelectItem value="VERY_ACTIVE">Muy activo (ejercicio intenso 6-7 días/semana)</SelectItem>
                              <SelectItem value="EXTREMELY_ACTIVE">Extremadamente activo (ejercicio muy intenso, trabajo físico)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="¿Cuál es tu objetivo?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LOSE">Perder peso</SelectItem>
                              <SelectItem value="MAINTAIN">Mantener peso</SelectItem>
                              <SelectItem value="GAIN">Ganar peso</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-between">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Anterior
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="ml-auto">
                      Siguiente
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="ml-auto">
                      {loading ? "Creando perfil..." : "Crear Perfil"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}