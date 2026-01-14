// app/api/meetings/[meetingId]/participants/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { meetingId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meetingId } = params

    // Fetch meeting participants with user details
    const { data: participants, error } = await supabase
      .from('meeting_participants')
      .select(`
        id,
        role,
        invitation_status,
        attendance_status,
        responded_at,
        users (
          id,
          name,
          email,
          role
        )
      `)
      .eq('meeting_id', meetingId)
      .order('role', { ascending: false })
      .order('users(name)')

    if (error) {
      console.error('Error fetching participants:', error)
      return NextResponse.json({ participants: [] })
    }

    // Transform the data
    const transformedParticipants = (participants || []).map(p => ({
      id: p.users.id,
      name: p.users.name,
      email: p.users.email,
      role: p.role,
      invitation_status: p.invitation_status,
      attendance_status: p.attendance_status,
      responded_at: p.responded_at
    }))

    return NextResponse.json({ participants: transformedParticipants })

  } catch (error: any) {
    console.error('Error in participants API:', error)
    return NextResponse.json({ participants: [] })
  }
}