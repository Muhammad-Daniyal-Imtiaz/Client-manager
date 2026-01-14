// app/api/meetings/user/route.ts
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
    const status = searchParams.get('status')

    // Get meetings where user is a participant
    const { data: meetings, error } = await supabase
      .from('meeting_participants')
      .select(`
        role,
        invitation_status,
        meetings (
          id,
          title,
          description,
          meeting_link,
          scheduled_date,
          start_time,
          end_time,
          duration_minutes,
          timezone,
          status,
          notes,
          agenda,
          created_at,
          meeting_types (name),
          created_by_user:users!meetings_created_by_fkey (name, email, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .eq('meetings.status', status || 'scheduled')
      .order('scheduled_date', { referencedTable: 'meetings', ascending: true })
      .order('start_time', { referencedTable: 'meetings', ascending: true })

    if (error) throw error

    // Get participant count for each meeting
    const meetingsWithParticipants = await Promise.all(
      (meetings || []).map(async (meeting: any) => {
        const { data: participants } = await supabase
          .from('meeting_participants')
          .select('count')
          .eq('meeting_id', meeting.meetings.id)
          .single()

        return {
          ...meeting.meetings,
          meeting_type: meeting.meetings.meeting_types.name,
          created_by: meeting.meetings.created_by_user,
          my_role: meeting.role,
          my_status: meeting.invitation_status,
          participant_count: participants?.count || 0
        }
      })
    )

    return NextResponse.json({ meetings: meetingsWithParticipants })

  } catch (error: any) {
    console.error('Error fetching meetings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}