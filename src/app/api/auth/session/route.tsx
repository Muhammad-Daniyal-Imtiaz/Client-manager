// app/api/auth/session/route.ts - SIMPLIFIED VERSION
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.log('No session found:', sessionError?.message)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Get user directly from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('No user found:', userError?.message)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    console.log('User authenticated:', user.email)

    // Get user from database
    const { data: dbUserData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // If user doesn't exist in DB, create them
    if (dbError && dbError.code === 'PGRST116') {
      const adminClient = createAdminClient()

      const { data: newUser, error: createError } = await adminClient
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'client',
          is_active: true,
          is_verified: !!user.email_confirmed_at
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create user:', createError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }

      // Return the newly created user
      return NextResponse.json({
        user: newUser,
        roleData: null
      })
    }

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      user: dbUserData,
      roleData: null // You can add this back later
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}