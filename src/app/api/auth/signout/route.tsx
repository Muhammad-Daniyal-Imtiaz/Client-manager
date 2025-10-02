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
  } catch (error: unknown) {
    console.error('Signout error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Signout failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}