// app/api/meetings/notifications/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let query = supabase
      .from('meeting_notifications')
      .select(`
        id,
        notification_type,
        title,
        message,
        is_read,
        is_sent,
        sent_at,
        read_at,
        created_at,
        metadata,
        meetings (
          id,
          title,
          scheduled_date,
          start_time,
          meeting_link
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    return NextResponse.json({ notifications })

  } catch (error: unknown) {
    console.error('Error fetching notifications:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds, markAsRead } = await request.json()

    const { error } = await supabase
      .from('meeting_notifications')
      .update({
        is_read: markAsRead,
        read_at: markAsRead ? new Date().toISOString() : null
      })
      .in('id', notificationIds)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    console.error('Error updating notifications:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}