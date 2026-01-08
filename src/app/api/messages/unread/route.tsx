import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Count unread messages
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'sent')

    if (error) {
      console.error('Error counting unread messages:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ unread_count: count || 0 })
  } catch (error) {
    console.error('Error in GET /api/messages/unread:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}