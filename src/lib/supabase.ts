import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  department: 'seo' | 'automation' | 'social_media' | 'email_marketing' | 'graphic_design'
  phase: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string
  company: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface ProjectProgress {
  id: string
  client_id: string
  department: string
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  pending_tasks: number
  created_at: string
  updated_at: string
} 