import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {  // ✅ No type annotation
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                if (options) {
                  cookieStore.set(name, value, options)
                } else {
                  cookieStore.set(name, value)
                }
              })
            } catch {
              // Ignore errors
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceRoleSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // No need to set cookies for service role client
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: users, error } = await serviceRoleSupabase
      .from('users')
      .select('id, name, email, avatar_url, role, phone, country, timezone, is_active, is_verified, last_login, created_at, updated_at')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const filteredUsers = users?.filter(u => u.id !== user.id) || []

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      count: filteredUsers.length
    })
  } catch (error: unknown) {
    console.error('Error in GET /api/users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 })
  }
}