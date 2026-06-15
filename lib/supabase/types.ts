export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      connections: {
        Row: {
          id: string
          user_a_id: string
          user_b_id: string
          status: 'pending' | 'accepted'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['connections']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['connections']['Insert']>
      }
      sharing_settings: {
        Row: {
          id: string
          owner_id: string
          connection_id: string
          category: string
          level: 'none' | 'show_few' | 'show_all'
        }
        Insert: Omit<Database['public']['Tables']['sharing_settings']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['sharing_settings']['Insert']>
      }
      habits: {
        Row: {
          id: string
          owner_id: string
          name: string
          frequency: 'daily' | 'specific_days'
          days_of_week: number[] | null
          color: string
          icon: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['habits']['Insert']>
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          date: string
          done: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['habit_logs']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['habit_logs']['Insert']>
      }
      weekly_goals: {
        Row: {
          id: string
          owner_id: string
          title: string
          points: 1 | 2
          week_start_date: string
          status: 'pending' | 'completed'
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['weekly_goals']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['weekly_goals']['Insert']>
      }
      rewards: {
        Row: {
          id: string
          owner_id: string
          title: string
          points_required: number
          week_start_date: string
          unlocked_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['rewards']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['rewards']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high'
          status: 'todo' | 'in_progress' | 'done'
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      recipes: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          ingredients: { name: string; amount: string; unit: string }[]
          cuisine: string | null
          tags: string[]
          liked: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['recipes']['Insert']>
      }
      reminders: {
        Row: {
          id: string
          owner_id: string
          title: string
          remind_at: string
          repeat: 'none' | 'daily' | 'weekly'
          done: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reminders']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reminders']['Insert']>
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>
      }
    }
  }
}
