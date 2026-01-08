import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // First, check if the user is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options as any)
              })
            } catch {
              // Ignore errors
            }
          },
        },
      }
    )
    
    // Get current user to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Now create a direct connection with service role key to bypass RLS
    const serviceRoleSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Direct service role key
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // No need to set cookies for service role client
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all users from the database using service role key
    const { data: users, error } = await serviceRoleSupabase
      .from('users')
      .select('id, name, email, avatar_url, role, phone, country, timezone, is_active, is_verified, last_login, created_at, updated_at')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter out current user from the list
    const filteredUsers = users?.filter(u => u.id !== user.id) || []

    return NextResponse.json({ users: filteredUsers })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}