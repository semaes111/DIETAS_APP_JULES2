// Generated types for Supabase - Update these after running your migrations
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          email_verified: string | null
          image: string | null
          password: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          email_verified?: string | null
          image?: string | null
          password?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          email_verified?: string | null
          image?: string | null
          password?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          age: number | null
          gender: 'MALE' | 'FEMALE' | 'OTHER' | null
          height: number | null
          weight: number | null
          activity_level: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE'
          goal: 'LOSE' | 'MAINTAIN' | 'GAIN'
          dietary_restrictions: string | null
          health_conditions: string | null
          bmr: number | null
          tdee: number | null
          target_calories: number | null
          target_protein: number | null
          target_carbs: number | null
          target_fat: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number | null
          gender?: 'MALE' | 'FEMALE' | 'OTHER' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE'
          goal?: 'LOSE' | 'MAINTAIN' | 'GAIN'
          dietary_restrictions?: string | null
          health_conditions?: string | null
          bmr?: number | null
          tdee?: number | null
          target_calories?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number | null
          gender?: 'MALE' | 'FEMALE' | 'OTHER' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE'
          goal?: 'LOSE' | 'MAINTAIN' | 'GAIN'
          dietary_restrictions?: string | null
          health_conditions?: string | null
          bmr?: number | null
          tdee?: number | null
          target_calories?: number | null
          target_protein?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      foods: {
        Row: {
          id: string
          name: string
          brand: string | null
          barcode: string | null
          description: string | null
          category: string
          serving_size: number
          calories_per_100g: number
          protein_per_100g: number
          carbs_per_100g: number
          fat_per_100g: number
          fiber_per_100g: number | null
          sugar_per_100g: number | null
          sodium_per_100g: number | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          barcode?: string | null
          description?: string | null
          category: string
          serving_size: number
          calories_per_100g: number
          protein_per_100g: number
          carbs_per_100g: number
          fat_per_100g: number
          fiber_per_100g?: number | null
          sugar_per_100g?: number | null
          sodium_per_100g?: number | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          barcode?: string | null
          description?: string | null
          category?: string
          serving_size?: number
          calories_per_100g?: number
          protein_per_100g?: number
          carbs_per_100g?: number
          fat_per_100g?: number
          fiber_per_100g?: number | null
          sugar_per_100g?: number | null
          sodium_per_100g?: number | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_meals: {
        Row: {
          id: string
          user_id: string
          food_id: string
          date: string
          meal_type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
          quantity: number
          calories: number
          protein: number
          carbs: number
          fat: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_id: string
          date: string
          meal_type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
          quantity: number
          calories: number
          protein: number
          carbs: number
          fat: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_id?: string
          date?: string
          meal_type?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
          quantity?: number
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          created_at?: string
        }
      }
      progress_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number | null
          body_fat: number | null
          muscle_mass: number | null
          waist: number | null
          chest: number | null
          hips: number | null
          notes: string | null
          mood: number | null
          energy_level: number | null
          sleep_hours: number | null
          water_intake: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight?: number | null
          body_fat?: number | null
          muscle_mass?: number | null
          waist?: number | null
          chest?: number | null
          hips?: number | null
          notes?: string | null
          mood?: number | null
          energy_level?: number | null
          sleep_hours?: number | null
          water_intake?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number | null
          body_fat?: number | null
          muscle_mass?: number | null
          waist?: number | null
          chest?: number | null
          hips?: number | null
          notes?: string | null
          mood?: number | null
          energy_level?: number | null
          sleep_hours?: number | null
          water_intake?: number | null
          created_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          instructions: string
          servings: number
          prep_time: number | null
          cook_time: number | null
          difficulty: string | null
          category: string | null
          image: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          instructions: string
          servings: number
          prep_time?: number | null
          cook_time?: number | null
          difficulty?: string | null
          category?: string | null
          image?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          instructions?: string
          servings?: number
          prep_time?: number | null
          cook_time?: number | null
          difficulty?: string | null
          category?: string | null
          image?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // NextAuth.js tables
      accounts: {
        Row: {
          id: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          session_token: string
          user_id: string
          expires: string
        }
        Insert: {
          id?: string
          session_token: string
          user_id: string
          expires: string
        }
        Update: {
          id?: string
          session_token?: string
          user_id?: string
          expires?: string
        }
      }
      verificationtokens: {
        Row: {
          identifier: string
          token: string
          expires: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_stats: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
    }
    Enums: {
      gender: 'MALE' | 'FEMALE' | 'OTHER'
      activitylevel: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE'
      goal: 'LOSE' | 'MAINTAIN' | 'GAIN'
      mealtype: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Helper types for common operations
export type UserWithProfile = Database['public']['Tables']['users']['Row'] & {
  profile?: Database['public']['Tables']['user_profiles']['Row']
}

export type UserMealWithFood = Database['public']['Tables']['user_meals']['Row'] & {
  food: Database['public']['Tables']['foods']['Row']
}

export type RecipeWithIngredients = Database['public']['Tables']['recipes']['Row'] & {
  ingredients: Array<{
    id: string
    quantity: number
    notes: string | null
    food: Database['public']['Tables']['foods']['Row']
  }>
}