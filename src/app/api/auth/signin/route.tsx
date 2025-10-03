// src/app/api/auth/signin/route.ts
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
      
      if (authError.message.includes('Invalid login credentials') || authError.code === 'invalid_credentials') {
        return NextResponse.json(
          { error: 'invalid_credentials' },
          { status: 400 }
        )
      }
      
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'email_not_confirmed' },
          { status: 400 }
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

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('Error fetching client data:', clientError)
    }

    // If no client record exists, create one (shouldn't happen but safety net)
    let clientData = client
    if (!client) {
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email!,
            name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
            company: authData.user.user_metadata?.company || 'Unknown',
            phone: authData.user.user_metadata?.phone || null,
            role: 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (!createError) {
        clientData = newClient
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      client: clientData || {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
        company: authData.user.user_metadata?.company || 'Unknown',
        phone: authData.user.user_metadata?.phone || null,
        role: 'client',
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at,
      }
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