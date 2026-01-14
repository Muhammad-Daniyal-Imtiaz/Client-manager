// app/api/meetings/create/route.ts
import { createClient } from '@/utils/supabase/server'
import { sendMeetingNotifications } from '@/lib/notifications'
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

    // Filter out the current user from participants
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

    // Wait for the trigger to add the creator as host
    await new Promise(resolve => setTimeout(resolve, 100))

    // Add other participants
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
      }
    }

    // Get participant details for notifications
    const { data: participantDetails } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', otherParticipants)

    const userEmails: { [key: string]: string } = {}
    const userNames: { [key: string]: string } = {}

    if (participantDetails) {
      participantDetails.forEach(p => {
        userEmails[p.id] = p.email
        userNames[p.id] = p.name
      })
    }

    // Get current user details for meeting data
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    // Send notifications and emails to participants
    if (otherParticipants.length > 0) {
      try {
        await sendMeetingNotifications({
          meeting_id: meeting.id,
          user_ids: otherParticipants,
          notification_type: 'invitation',
          user_emails: userEmails,
          user_names: userNames,
          meeting_data: {
            title: meeting.title,
            description: meeting.description,
            scheduled_date: meeting.scheduled_date,
            start_time: meeting.start_time,
            end_time: meeting.end_time,
            meeting_link: meeting.meeting_link,
            created_by_name: userData?.name || 'Meeting Organizer'
          }
        })
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError)
        // Continue - notification failure shouldn't block meeting creation
      }
    }

    return NextResponse.json({
      success: true,
      meeting,
      message: 'Meeting created successfully and invitations sent'
    })
  } catch (error: any) {
    console.error('Error creating meeting:', error)
    return NextResponse.json({
      error: error.message || 'Failed to create meeting',
      details: error.details || null
    }, { status: 500 })
  }
}