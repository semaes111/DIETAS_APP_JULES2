-- =====================================================
-- Supabase Row Level Security (RLS) Policies Setup
-- =====================================================
-- Run this script in Supabase SQL Editor after migration

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- User Management Policies
-- =====================================================

-- Users can read their own user record
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own user record
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- =====================================================
-- User Profile Policies
-- =====================================================

-- Users can manage their own profile
CREATE POLICY "Users can view own user profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own user profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own user profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own user profile" ON user_profiles
  FOR DELETE USING (auth.uid()::text = user_id);

-- =====================================================
-- Food Database Policies
-- =====================================================

-- Everyone can read foods (public food database)
CREATE POLICY "Anyone can view foods" ON foods
  FOR SELECT USING (true);

-- Only admins can create/update/delete foods
CREATE POLICY "Admins can manage foods" ON foods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- =====================================================
-- Meal Planning Policies
-- =====================================================

-- Users can manage their own meal plans
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid()::text = user_id);

-- Meals policies (via meal plan ownership)
CREATE POLICY "Users can view own meals" ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE id = meal_plan_id AND user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage own meals" ON meals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE id = meal_plan_id AND user_id = auth.uid()::text
    )
  );

-- Meal items policies (via meal ownership)
CREATE POLICY "Users can view own meal items" ON meal_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meals m
      JOIN meal_plans mp ON m.meal_plan_id = mp.id
      WHERE m.id = meal_id AND mp.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage own meal items" ON meal_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meals m
      JOIN meal_plans mp ON m.meal_plan_id = mp.id
      WHERE m.id = meal_id AND mp.user_id = auth.uid()::text
    )
  );

-- =====================================================
-- User Meals Policies
-- =====================================================

-- Users can manage their own user meals
CREATE POLICY "Users can view own user meals" ON user_meals
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own user meals" ON user_meals
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own user meals" ON user_meals
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own user meals" ON user_meals
  FOR DELETE USING (auth.uid()::text = user_id);

-- =====================================================
-- Recipe Policies
-- =====================================================

-- Users can view public recipes and their own recipes
CREATE POLICY "Users can view public and own recipes" ON recipes
  FOR SELECT USING (is_public = true OR auth.uid()::text = user_id);

-- Users can manage their own recipes
CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid()::text = user_id);

-- Recipe ingredients policies (via recipe ownership)
CREATE POLICY "Users can view recipe ingredients for accessible recipes" ON recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id 
      AND (r.is_public = true OR r.user_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can manage own recipe ingredients" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()::text
    )
  );

-- Recipe nutrition policies (via recipe ownership)
CREATE POLICY "Users can view recipe nutrition for accessible recipes" ON recipe_nutrition
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id 
      AND (r.is_public = true OR r.user_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can manage own recipe nutrition" ON recipe_nutrition
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id AND r.user_id = auth.uid()::text
    )
  );

-- =====================================================
-- Progress Tracking Policies
-- =====================================================

-- Users can manage their own progress logs
CREATE POLICY "Users can view own progress logs" ON progress_logs
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own progress logs" ON progress_logs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress logs" ON progress_logs
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own progress logs" ON progress_logs
  FOR DELETE USING (auth.uid()::text = user_id);

-- =====================================================
-- Shopping List Policies
-- =====================================================

-- Users can manage their own shopping lists
CREATE POLICY "Users can view own shopping lists" ON shopping_lists
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own shopping lists" ON shopping_lists
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own shopping lists" ON shopping_lists
  FOR DELETE USING (auth.uid()::text = user_id);

-- Shopping list items policies (via shopping list ownership)
CREATE POLICY "Users can view own shopping list items" ON shopping_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_list_id AND sl.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage own shopping list items" ON shopping_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_list_id AND sl.user_id = auth.uid()::text
    )
  );

-- =====================================================
-- Admin Policies (Override user policies)
-- =====================================================

-- Admins can manage all data
CREATE POLICY "Admins can manage all meal plans" ON meal_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all user meals" ON user_meals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all recipes" ON recipes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all progress logs" ON progress_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all shopping lists" ON shopping_lists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- =====================================================
-- Create indexes for better performance
-- =====================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Food indexes
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_is_verified ON foods(is_verified);

-- User meals indexes
CREATE INDEX IF NOT EXISTS idx_user_meals_user_id ON user_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meals_date ON user_meals(date);
CREATE INDEX IF NOT EXISTS idx_user_meals_user_date ON user_meals(user_id, date);

-- Progress logs indexes
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_id ON progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_date ON progress_logs(date);
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_date ON progress_logs(user_id, date);

-- Meal plans indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_is_active ON meal_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_meal_plans_dates ON meal_plans(start_date, end_date);

-- =====================================================
-- Create functions for commonly used queries
-- =====================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total_recipes', (SELECT COUNT(*) FROM recipes WHERE user_id = user_uuid::text),
        'total_meal_plans', (SELECT COUNT(*) FROM meal_plans WHERE user_id = user_uuid::text),
        'total_progress_logs', (SELECT COUNT(*) FROM progress_logs WHERE user_id = user_uuid::text),
        'latest_weight', (
            SELECT weight FROM progress_logs 
            WHERE user_id = user_uuid::text AND weight IS NOT NULL
            ORDER BY date DESC LIMIT 1
        ),
        'account_created', (SELECT created_at FROM users WHERE id = user_uuid::text)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO authenticated;

-- =====================================================
-- Enable real-time subscriptions (optional)
-- =====================================================

-- Enable realtime for user meals (for live tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE user_meals;
ALTER PUBLICATION supabase_realtime ADD TABLE progress_logs;

-- =====================================================
-- Security: Revoke unnecessary permissions
-- =====================================================

-- Revoke all permissions on auth schema from public
REVOKE ALL ON SCHEMA auth FROM public;

-- Only allow authenticated users to access main tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO authenticated;

COMMENT ON SCHEMA public IS 'Dietas App - Mediterranean Diet Tracking Application';

-- =====================================================
-- Final validation
-- =====================================================

-- Test that RLS is working properly
DO $$
BEGIN
    -- This should succeed for a valid setup
    IF (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 0 THEN
        RAISE NOTICE 'RLS policies created successfully: % policies found', 
            (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public');
    ELSE
        RAISE EXCEPTION 'No RLS policies found! Setup may have failed.';
    END IF;
END $$;