// app/api/meetings/create/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const { title, meeting_type_id, meeting_link, scheduled_date, start_time, participants } = body
    
    if (!title || !meeting_type_id || !meeting_link || !scheduled_date || !start_time || !participants) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, meeting_type_id, meeting_link, scheduled_date, start_time, participants' 
      }, { status: 400 })
    }

    // Filter out the current user from participants (they'll be added as host automatically)
    const otherParticipants = participants.filter((participantId: string) => participantId !== user.id)

    // Create meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title: title.trim(),
        description: body.description?.trim() || null,
        meeting_type_id,
        meeting_link: meeting_link.trim(),
        scheduled_date,
        start_time,
        end_time: body.end_time || null,
        timezone: body.timezone || 'UTC',
        created_by: user.id,
        notes: body.notes?.trim() || null,
        agenda: body.agenda || null
      })
      .select()
      .single()

    if (meetingError) {
      console.error('Error creating meeting:', meetingError)
      throw meetingError
    }

    // Wait a moment for the trigger to add the creator as host
    await new Promise(resolve => setTimeout(resolve, 100))

    // Add only other participants (creator is added by trigger)
    if (otherParticipants.length > 0) {
      const participantsToAdd = otherParticipants.map((participantId: string) => ({ 
        meeting_id: meeting.id, 
        user_id: participantId, 
        role: 'attendee',
        invitation_status: 'pending'
      }))

      const { error: participantsError } = await supabase
        .from('meeting_participants')
        .insert(participantsToAdd)

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        // Don't throw here, just log - meeting is already created
        console.log('Continuing despite participant error')
      }
    }

    return NextResponse.json({ 
      success: true, 
      meeting, 
      message: 'Meeting created successfully' 
    })

  } catch (error: any) {
    console.error('Error creating meeting:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create meeting',
      details: error.details || null
    }, { status: 500 })
  }
}