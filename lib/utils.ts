import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`
}

export function formatHeight(height: number): string {
  return `${height} cm`
}

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Bajo peso"
  if (bmi < 25) return "Peso normal"
  if (bmi < 30) return "Sobrepeso"
  return "Obesidad"
}

export function calculateBMR(
  weight: number, 
  height: number, 
  age: number, 
  gender: "male" | "female"
): number {
  // Mifflin-St Jeor Equation
  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age)
  return gender === "male" ? baseBMR + 5 : baseBMR - 161
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  }
  
  return bmr * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2)
}

export function calculateMacros(calories: number, goal: "lose" | "maintain" | "gain") {
  let proteinRatio: number
  let fatRatio: number
  let carbRatio: number

  switch (goal) {
    case "lose":
      proteinRatio = 0.35 // Higher protein for muscle preservation
      fatRatio = 0.30
      carbRatio = 0.35
      break
    case "gain":
      proteinRatio = 0.25
      fatRatio = 0.25
      carbRatio = 0.50 // Higher carbs for energy
      break
    default: // maintain
      proteinRatio = 0.30
      fatRatio = 0.30
      carbRatio = 0.40
  }

  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 calories per gram
    fat: Math.round((calories * fatRatio) / 9), // 9 calories per gram
    carbs: Math.round((calories * carbRatio) / 4), // 4 calories per gram
  }
}