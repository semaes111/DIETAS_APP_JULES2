'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  ArrowRight,
  Code,
  Settings
} from 'lucide-react'

const SQL_SCRIPT = `-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE activity_level AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE');
CREATE TYPE goal AS ENUM ('LOSE', 'MAINTAIN', 'GAIN');
CREATE TYPE meal_type AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  image TEXT,
  password TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  age INTEGER,
  gender gender,
  height REAL,
  weight REAL,
  activity_level activity_level DEFAULT 'SEDENTARY',
  goal goal DEFAULT 'MAINTAIN',
  dietary_restrictions TEXT,
  health_conditions TEXT,
  bmr REAL,
  tdee REAL,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create foods table
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  serving_size REAL NOT NULL,
  calories_per_100g REAL NOT NULL,
  protein_per_100g REAL NOT NULL,
  carbs_per_100g REAL NOT NULL,
  fat_per_100g REAL NOT NULL,
  fiber_per_100g REAL,
  sugar_per_100g REAL,
  sodium_per_100g REAL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_meals table
CREATE TABLE IF NOT EXISTS user_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meal_type meal_type NOT NULL,
  quantity REAL NOT NULL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_logs table
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight REAL,
  body_fat REAL,
  muscle_mass REAL,
  waist REAL,
  chest REAL,
  hips REAL,
  notes TEXT,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  sleep_hours REAL,
  water_intake REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_is_verified ON foods(is_verified);
CREATE INDEX IF NOT EXISTS idx_user_meals_user_id ON user_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meals_date ON user_meals(date);
CREATE INDEX IF NOT EXISTS idx_user_meals_meal_type ON user_meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_user_meals_user_date ON user_meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_id ON progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_date ON progress_logs(date);

-- Insert sample Mediterranean foods
INSERT INTO foods (name, category, serving_size, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_verified) VALUES
('Aceite de oliva virgen extra', 'Grasas saludables', 15, 884, 0, 0, 100, 0, true),
('Salmón fresco', 'Pescados', 150, 208, 25.4, 0, 12.4, 0, true),
('Quinoa cocida', 'Cereales', 100, 120, 4.4, 21.3, 1.9, 2.8, true),
('Aguacate', 'Frutas', 100, 160, 2, 8.5, 14.7, 6.7, true),
('Almendras', 'Frutos secos', 30, 579, 21.2, 21.6, 49.9, 12.5, true),
('Yogur griego natural', 'Lácteos', 150, 59, 10, 3.6, 0.4, 0, true),
('Tomate cherry', 'Verduras', 100, 18, 0.9, 3.9, 0.2, 1.2, true),
('Espinacas frescas', 'Verduras', 100, 23, 2.9, 3.6, 0.4, 2.2, true),
('Pechuga de pollo', 'Carnes', 150, 165, 31, 0, 3.6, 0, true),
('Lentejas cocidas', 'Legumbres', 150, 116, 9, 20, 0.4, 7.9, true),
('Pan integral', 'Cereales', 50, 247, 13, 41, 4.2, 7, true),
('Queso feta', 'Lácteos', 50, 264, 14, 4.1, 21, 0, true),
('Sardinas en aceite', 'Pescados', 100, 208, 25, 0, 11, 0, true),
('Brócoli', 'Verduras', 150, 34, 2.8, 7, 0.4, 2.6, true),
('Naranja', 'Frutas', 150, 47, 0.9, 12, 0.1, 2.4, true),
('Garbanzos cocidos', 'Legumbres', 150, 164, 8.9, 27, 2.6, 7.6, true),
('Atún al natural', 'Pescados', 100, 116, 26, 0, 1, 0, true),
('Nueces', 'Frutos secos', 30, 654, 15, 14, 65, 6.7, true),
('Mozzarella', 'Lácteos', 50, 300, 22, 2.2, 22, 0, true),
('Berenjenas', 'Verduras', 150, 25, 1, 6, 0.2, 3, true)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified foods" ON foods FOR SELECT USING (is_verified = true);
CREATE POLICY "Users can create foods" ON foods FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own meals" ON user_meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON user_meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON user_meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON user_meals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON progress_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON progress_logs FOR DELETE USING (auth.uid() = user_id);`;

export default function SetupDatabasePage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Configuración de Base de Datos
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configura tu proyecto de Supabase para NutriMed
          </p>
        </div>

        {/* Instructions */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Instrucciones de Configuración
              </CardTitle>
              <CardDescription>
                Sigue estos pasos para configurar tu base de datos de Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-1">1</Badge>
                  <div>
                    <p className="font-medium">Accede a tu Dashboard de Supabase</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Ve a{' '}
                      <a 
                        href="https://supabase.com/dashboard" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        supabase.com/dashboard
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-1">2</Badge>
                  <div>
                    <p className="font-medium">Ve al Editor SQL</p>
                    <p className="text-sm text-gray-600 mt-1">
                      En tu proyecto, navega a la sección "SQL Editor" en el menú lateral
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-1">3</Badge>
                  <div>
                    <p className="font-medium">Copia y ejecuta el script SQL</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Copia el script de abajo y pégalo en el editor SQL, luego haz clic en "Run"
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-1">4</Badge>
                  <div>
                    <p className="font-medium">Verifica la configuración</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Revisa que las tablas se hayan creado correctamente en la sección "Table Editor"
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* SQL Script */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2 text-green-600" />
                    Script SQL de Configuración
                  </CardTitle>
                  <CardDescription>
                    Este script creará todas las tablas, índices y políticas necesarias
                  </CardDescription>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar Script</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                  <code>{SQL_SCRIPT}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Este script es seguro y utiliza "IF NOT EXISTS" para evitar 
              sobrescribir datos existentes. Incluye políticas de seguridad (RLS) para proteger 
              la información de los usuarios.
            </AlertDescription>
          </Alert>

          {/* Next Steps */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <ArrowRight className="h-5 w-5 mr-2" />
                Siguientes Pasos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Una vez que hayas ejecutado el script SQL exitosamente:
              </p>
              <div className="space-y-2">
                <p className="text-sm text-green-600">✓ Las tablas estarán creadas con datos de alimentos mediterráneos</p>
                <p className="text-sm text-green-600">✓ Las políticas de seguridad estarán activadas</p>
                <p className="text-sm text-green-600">✓ La aplicación estará lista para usar</p>
              </div>
              <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                <a href="/auth/signup">
                  Ir a Crear Cuenta
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}