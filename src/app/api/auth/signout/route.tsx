// src/app/api/auth/signout/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { error: error.message || 'Signout failed' },
      { status: 500 }
    )
  }
}