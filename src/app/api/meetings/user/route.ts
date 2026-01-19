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

    interface MeetingParticipantJoin {
      role: string
      invitation_status: string
      meetings: {
        id: string
        title: string
        description: string | null
        meeting_link: string | null
        scheduled_date: string
        start_time: string
        end_time: string | null
        duration_minutes: number | null
        timezone: string
        status: string
        notes: string | null
        agenda: unknown | null
        created_at: string
        meeting_types: { name: string }
        created_by_user: { name: string; email: string; avatar_url: string | null }
      }
    }

    // Get participant count for each meeting
    const meetingsWithParticipants = await Promise.all(
      (meetings as unknown as MeetingParticipantJoin[] || []).map(async (meeting: MeetingParticipantJoin) => {
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
          participant_count: (participants as { count: number } | null)?.count || 0
        }
      })
    )

    return NextResponse.json({ meetings: meetingsWithParticipants })

  } catch (error: unknown) {
    console.error('Error fetching meetings:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}