'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Database, Trash2, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface ImportResult {
  success: boolean
  message: string
  processed: number
  errors: string[]
}

interface DatabaseStats {
  foods: number
  recipes: number
  mealPlans: number
  users: number
}

export default function AdminImportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<{
    foods: File | null
    recipes: File | null
    mealPlans: File | null
  }>({
    foods: null,
    recipes: null,
    mealPlans: null
  })

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Note: In a real app, you'd check if user.isAdmin here
    // For now, we'll let the API endpoints handle admin validation
    loadDatabaseStats()
  }, [session, status, router])

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch('/api/admin/import/clear-db')
      if (response.ok) {
        const data = await response.json()
        setDbStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load database stats:', error)
    }
  }

  const handleFileSelect = (type: 'foods' | 'recipes' | 'mealPlans', file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [type]: file }))
    setResult(null) // Clear previous results
  }

  const importData = async (endpoint: string, file: File) => {
    setIsLoading(true)
    setUploadProgress(0)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch(`/api/admin/import/${endpoint}`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()
      setResult(data)

      if (data.success) {
        await loadDatabaseStats() // Refresh stats
      }

    } catch (error) {
      setResult({
        success: false,
        message: `Upload failed: ${error}`,
        processed: 0,
        errors: [String(error)]
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const clearDatabase = async () => {
    if (!confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/import/clear-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: 'CLEAR_ALL_DATA' }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        await loadDatabaseStats()
      }

    } catch (error) {
      setResult({
        success: false,
        message: `Clear failed: ${error}`,
        processed: 0,
        errors: [String(error)]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadSample = async (type: 'foods' | 'recipes' | 'meal-plans') => {
    try {
      const sampleType = type === 'foods' ? 'foods-csv' : 
                         type === 'recipes' ? 'recipes-json' : 'meal-plans-json'
      
      const response = await fetch(`/api/admin/import/sample-data?type=${sampleType}`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sample_${type}_comprehensive.${type === 'foods' ? 'csv' : 'json'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Import Administration</h1>
        <p className="text-muted-foreground mt-2">
          Import nutrition data, recipes, and meal plans into the application
        </p>
      </div>

      {/* Database Statistics */}
      {dbStats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dbStats.foods}</div>
                <div className="text-sm text-muted-foreground">Foods</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dbStats.recipes}</div>
                <div className="text-sm text-muted-foreground">Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{dbStats.mealPlans}</div>
                <div className="text-sm text-muted-foreground">Meal Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{dbStats.users}</div>
                <div className="text-sm text-muted-foreground">Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {result && (
        <Alert className={`mb-8 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">{result.message}</p>
              {result.processed > 0 && (
                <p className="text-sm">Processed: {result.processed} items</p>
              )}
              {result.errors.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium text-red-600 mb-1">Errors:</p>
                  <ul className="list-disc pl-4 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.slice(0, 10).map((error, index) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="text-red-600">... and {result.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {isLoading && uploadProgress > 0 && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading and processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Foods Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Foods
            </CardTitle>
            <CardDescription>
              Upload CSV file containing food nutrition data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="foods-file">Select CSV File</Label>
              <Input
                id="foods-file"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect('foods', e.target.files?.[0] || null)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => selectedFiles.foods && importData('foods', selectedFiles.foods)}
                disabled={!selectedFiles.foods || isLoading}
                className="flex-1"
              >
                Import Foods
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadSample('foods')}
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Expected columns:</p>
              <p>name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g</p>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Recipes
            </CardTitle>
            <CardDescription>
              Upload JSON file containing recipe data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipes-file">Select JSON File</Label>
              <Input
                id="recipes-file"
                type="file"
                accept=".json"
                onChange={(e) => handleFileSelect('recipes', e.target.files?.[0] || null)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => selectedFiles.recipes && importData('recipes', selectedFiles.recipes)}
                disabled={!selectedFiles.recipes || isLoading}
                className="flex-1"
              >
                Import Recipes
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadSample('recipes')}
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Expected format: JSON array with recipe objects</p>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plans Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Meal Plans
            </CardTitle>
            <CardDescription>
              Upload JSON file containing meal plan data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meal-plans-file">Select JSON File</Label>
              <Input
                id="meal-plans-file"
                type="file"
                accept=".json"
                onChange={(e) => handleFileSelect('mealPlans', e.target.files?.[0] || null)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => selectedFiles.mealPlans && importData('meal-plans', selectedFiles.mealPlans)}
                disabled={!selectedFiles.mealPlans || isLoading}
                className="flex-1"
              >
                Import Meal Plans
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadSample('meal-plans')}
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Expected format: JSON array with meal plan objects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible operations that will affect all application data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={clearDatabase}
            disabled={isLoading}
          >
            Clear All Data
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will permanently delete all foods, recipes, meal plans, and user data. This action cannot be undone.
          </p>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Import Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">File Format Requirements:</h4>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li><strong>Foods:</strong> CSV format with headers (download sample for format)</li>
              <li><strong>Recipes:</strong> JSON array format (download sample for structure)</li>
              <li><strong>Meal Plans:</strong> JSON array format (download sample for structure)</li>
              <li><strong>File Size Limit:</strong> Maximum 10MB per file</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Data Validation:</h4>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>All required fields must be present and valid</li>
              <li>Numeric fields (calories, protein, etc.) must be valid numbers</li>
              <li>Recipe ingredients and meal plan foods will be matched by name</li>
              <li>Invalid records will be skipped with error reporting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}