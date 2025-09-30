// src/app/api/auth/session/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ client: null }, { status: 200 })
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', user.id)
      .single()

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('Error fetching client data:', clientError)
    }

    return NextResponse.json({ 
      client: client || {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        company: user.user_metadata?.company || 'Unknown',
        phone: user.user_metadata?.phone || null,
        role: 'client',
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}