-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE activity_level AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE');
CREATE TYPE goal AS ENUM ('LOSE', 'MAINTAIN', 'GAIN');
CREATE TYPE meal_type AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- Create users table (Supabase auth will handle this, but we add custom fields)
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

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  servings INTEGER NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  difficulty TEXT,
  category TEXT,
  image TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_date ON progress_logs(user_id, date);

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
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- User profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Foods are public for viewing, but only verified ones
CREATE POLICY "Anyone can view verified foods" ON foods FOR SELECT USING (is_verified = true);
CREATE POLICY "Users can create foods" ON foods FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User meals
CREATE POLICY "Users can view own meals" ON user_meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON user_meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON user_meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON user_meals FOR DELETE USING (auth.uid() = user_id);

-- Progress logs
CREATE POLICY "Users can view own progress" ON progress_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON progress_logs FOR DELETE USING (auth.uid() = user_id);

-- Meal plans
CREATE POLICY "Users can view own meal plans" ON meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal plans" ON meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal plans" ON meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal plans" ON meal_plans FOR DELETE USING (auth.uid() = user_id);

-- Recipes
CREATE POLICY "Users can view public recipes" ON recipes FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Shopping lists
CREATE POLICY "Users can view own shopping lists" ON shopping_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shopping lists" ON shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shopping lists" ON shopping_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shopping lists" ON shopping_lists FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();