"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { TrendingUp, Target, Calendar, Zap } from "lucide-react"

interface NutritionData {
  macroData: Array<{
    name: string
    value: number
    target: number
    color: string
  }>
  pieChartData: Array<{
    name: string
    value: number
    color: string
  }>
  weeklyData: Array<{
    day: string
    calories: number
    target: number
  }>
  totalCalories: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'calories' ? ' kcal' : 'g'}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.color }}>
          {`${payload[0].value}g`}
        </p>
      </div>
    )
  }
  return null
}

export function NutritionSummary() {
  const [data, setData] = useState<NutritionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        const response = await fetch("/api/nutrition/summary")
        if (response.ok) {
          const nutritionData = await response.json()
          setData(nutritionData)
        } else {
          setError("Error al cargar datos de nutrición")
        }
      } catch (error) {
        console.error("Error fetching nutrition data:", error)
        setError("Error de conexión")
      } finally {
        setLoading(false)
      }
    }

    fetchNutritionData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500 mb-4">{error || "No se pudieron cargar los datos"}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalMacros = data.macroData.reduce((sum, macro) => sum + macro.value, 0)
  const avgWeeklyCalories = Math.round(
    data.weeklyData.reduce((sum, day) => sum + day.calories, 0) / data.weeklyData.length
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Enhanced Macronutrients Progress */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Macronutrientes de Hoy
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total: {data.totalCalories} kcal • {totalMacros}g macros
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.macroData.map((macro) => {
            const percentage = (macro.value / macro.target) * 100
            const remaining = Math.max(0, macro.target - macro.value)
            
            return (
              <div key={macro.name} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: macro.color }}
                    />
                    <span className="font-medium text-sm">{macro.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">
                      {macro.value}g
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      / {macro.target}g
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-3 bg-gray-100"
                  />
                  <div 
                    className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      background: `linear-gradient(90deg, ${macro.color}88, ${macro.color})`
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${percentage >= 100 ? 'text-green-600' : 'text-gray-600'}`}>
                    {Math.round(percentage)}% completado
                  </span>
                  <span className="text-muted-foreground">
                    {remaining > 0 ? `${remaining}g restantes` : '¡Objetivo alcanzado!'}
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Enhanced Macro Distribution with Animation */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-full -translate-y-16 -translate-x-16" />
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="h-5 w-5 mr-2 text-green-600" />
            Distribución de Macros
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Proporción de macronutrientes consumidos
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{totalMacros}g</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 mt-4">
            {data.pieChartData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-center">
                  <span className="text-sm font-medium block">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.value}g</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Weekly Progress with Trend Analysis */}
      <Card className="lg:col-span-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-50 to-transparent rounded-full -translate-y-20 translate-x-20" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Progreso Semanal - Calorías
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Promedio semanal: {avgWeeklyCalories} kcal
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">
                {data.weeklyData.filter(d => d.calories > 0).length}/7 días activos
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#6b7280"
                  strokeWidth={2}
                  fill="url(#targetGradient)"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#caloriesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Weekly insights */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-700">
                {data.weeklyData.filter(d => d.calories >= d.target * 0.8).length}
              </p>
              <p className="text-xs text-green-600">Días con 80%+ del objetivo</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-700">
                {Math.round(data.weeklyData.reduce((sum, day) => sum + day.calories, 0))}
              </p>
              <p className="text-xs text-blue-600">Total semanal (kcal)</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-lg font-bold text-purple-700">
                {Math.max(...data.weeklyData.map(d => d.calories))}
              </p>
              <p className="text-xs text-purple-600">Día más alto (kcal)</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-lg font-bold text-orange-700">
                {Math.round((avgWeeklyCalories / (data.weeklyData[0]?.target || 2000)) * 100)}%
              </p>
              <p className="text-xs text-orange-600">Promedio vs objetivo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}