// src/app/api/auth/signup/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name, company, phone } = await request.json()

    if (!email || !password || !name || !company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Server error during signup' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'email_exists' },
        { status: 400 }
      )
    }

    // Get the base URL from the request for dynamic redirect
    const baseUrl = new URL(request.url).origin
    
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          company: company,
          phone: phone || null,
        },
        emailRedirectTo: `${baseUrl}/dashboard`,
      },
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      
      if (authError.message.includes('already registered') || authError.code === 'user_already_exists') {
        return NextResponse.json(
          { error: 'email_exists' },
          { status: 400 }
        )
      }
      
      if (authError.message.includes('password')) {
        return NextResponse.json(
          { error: 'weak_password' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (authData.user) {
      // Create client record in the database using the user's ID
      const { error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            id: authData.user.id, // Use the same ID as auth user
            name: name,
            email: email,
            company: company,
            phone: phone || null,
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

      if (clientError) {
        console.error('Error creating client record:', clientError)
        // If client record fails, we should handle this gracefully
        // The auth user exists but client record failed
        return NextResponse.json(
          { 
            success: true,
            message: 'Account created but there was an issue with profile setup. Please contact support.',
            client: null
          },
          { status: 201 }
        )
      }
    }

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: authData.session 
        ? 'Signup successful! Redirecting...' 
        : 'Please check your email to verify your account before signing in.',
      client: authData.user ? {
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        company: company,
        phone: phone || null,
        role: 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } : null
    })
    
  } catch (error: unknown) {
    console.error('Signup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Signup failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}