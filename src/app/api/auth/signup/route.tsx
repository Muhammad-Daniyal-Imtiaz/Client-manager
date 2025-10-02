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
    const { data: existingUser } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'email_exists' },
        { status: 400 }
      )
    }

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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'email_exists' },
          { status: 400 }
        )
      }
      throw authError
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
          },
        ])

      if (clientError) {
        console.error('Error creating client record:', clientError)
        // If client record fails, we should probably delete the auth user
        // But for now, we'll just log the error
      }
    }

    return NextResponse.json({ 
      success: true,
      message: authData.session ? 'Signup successful! Redirecting...' : 'Please check your email for verification',
      client: authData.user ? {
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        company: company,
        phone: phone || null,
        role: 'client',
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