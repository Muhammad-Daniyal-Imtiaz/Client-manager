import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Auth signin error:', authError)
      
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
      
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please verify your email before signing in' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 400 }
      )
    }

    // Get user data with role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Update last login
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user,
      session: authData.session
    })
    
  } catch (error: unknown) {
    console.error('Signin error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Signin failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}