// src/app/api/auth/signin/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'invalid_credentials' },
          { status: 401 }
        )
      }
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'email_not_confirmed' },
          { status: 401 }
        )
      }
      throw authError
    }

    // Check if client exists, if not create one
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    let client = existingClient;

    // If client doesn't exist, create one
    if (!existingClient && clientCheckError?.code === 'PGRST116') {
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
            company: authData.user.user_metadata?.company || 'Unknown',
            phone: authData.user.user_metadata?.phone || null,
            role: 'client',
          },
        ])
        .select()
        .single()

      if (!createError) {
        client = newClient;
      }
    }

    return NextResponse.json({ 
      client: client || {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
        company: authData.user.user_metadata?.company || 'Unknown',
        phone: authData.user.user_metadata?.phone || null,
        role: 'client',
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at
      }
    })
  } catch (error: any) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: error.message || 'Signin failed' },
      { status: 500 }
    )
  }
}