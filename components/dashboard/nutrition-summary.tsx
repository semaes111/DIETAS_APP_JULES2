"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
  Legend
} from "recharts"

// Demo data - in a real app, this would come from the API
const macroData = [
  { name: "Proteínas", value: 89, target: 150, color: "#ef4444" },
  { name: "Carbohidratos", value: 145, target: 200, color: "#3b82f6" },
  { name: "Grasas", value: 45, target: 67, color: "#eab308" },
]

const pieChartData = [
  { name: "Proteínas", value: 89, color: "#ef4444" },
  { name: "Carbohidratos", value: 145, color: "#3b82f6" },
  { name: "Grasas", value: 45, color: "#eab308" },
]

const weeklyData = [
  { day: "Lun", calories: 1850, target: 2000 },
  { day: "Mar", calories: 1920, target: 2000 },
  { day: "Mié", calories: 1780, target: 2000 },
  { day: "Jue", calories: 2100, target: 2000 },
  { day: "Vie", calories: 1890, target: 2000 },
  { day: "Sáb", calories: 2200, target: 2000 },
  { day: "Dom", calories: 1450, target: 2000 },
]

export function NutritionSummary() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Macronutrients Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Macronutrientes de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {macroData.map((macro) => {
            const percentage = (macro.value / macro.target) * 100
            return (
              <div key={macro.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{macro.name}</span>
                  <span className="text-muted-foreground">
                    {macro.value}g / {macro.target}g
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{
                    background: `${macro.color}20`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(percentage)}% completado</span>
                  <span>{macro.target - macro.value}g restantes</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Macro Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}g`, "Cantidad"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {pieChartData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Progreso Semanal - Calorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#10b981" name="Consumidas" />
                <Bar dataKey="target" fill="#6b7280" name="Objetivo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}