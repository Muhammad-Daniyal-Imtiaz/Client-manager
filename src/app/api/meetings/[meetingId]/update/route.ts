// app/api/meetings/[meetingId]/update/route.ts
import { createClient } from '@/utils/supabase/server'
import { sendMeetingNotifications } from '@/lib/notifications'
import { NextResponse } from 'next/server'

interface UserInfo {
  name: string
  email?: string
}

interface MeetingParticipant {
  user_id: string
  users: UserInfo
}

interface CreatorUser {
  name: string
}

interface MeetingData {
  id: string
  title: string
  description: string | null
  scheduled_date: string
  start_time: string
  end_time: string | null
  meeting_link: string | null
  status: string
  created_by: string
  created_by_user: CreatorUser | null
  meeting_participants: MeetingParticipant[]
}

export async function PUT(
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
    const body = await request.json()

    // Get current meeting data
    const { data: currentMeeting } = await supabase
      .from('meetings')
      .select(
        `
        id, title, description, scheduled_date, start_time, end_time, meeting_link, status,
        created_by,
        created_by_user:users!meetings_created_by_fkey (name),
        meeting_participants (
          user_id,
          users (name, email)
        )
      `
      )
      .eq('id', meetingId)
      .single() as { data: MeetingData | null; error: { message: string; details: string; hint: string; code: string } | null }

    if (!currentMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Only meeting creator can update the meeting
    if (currentMeeting.created_by !== user.id) {
      return NextResponse.json({ error: 'Only meeting creator can update the meeting' }, { status: 403 })
    }

    // Prepare update data
    interface MeetingUpdateData {
      title?: string
      description?: string | null
      scheduled_date?: string
      start_time?: string
      end_time?: string | null
      meeting_link?: string | null
      status?: string
    }
    const updateData: MeetingUpdateData = {}
    let statusChanged = false
    let changeDetails = ''

    if (body.title !== undefined) {
      updateData.title = body.title.trim()
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }

    if (body.scheduled_date !== undefined) {
      updateData.scheduled_date = body.scheduled_date
      changeDetails += `Date changed to ${body.scheduled_date}. `
    }

    if (body.start_time !== undefined) {
      updateData.start_time = body.start_time
      changeDetails += `Time changed to ${body.start_time}. `
    }

    if (body.end_time !== undefined) {
      updateData.end_time = body.end_time || null
    }

    if (body.meeting_link !== undefined) {
      updateData.meeting_link = body.meeting_link.trim()
      changeDetails += `Meeting link updated. `
    }

    if (body.status !== undefined && body.status !== currentMeeting.status) {
      updateData.status = body.status
      statusChanged = true

      if (body.status === 'cancelled') {
        changeDetails = `Meeting has been cancelled. ${changeDetails}`
      } else if (body.status === 'rescheduled') {
        changeDetails = `Meeting has been rescheduled. ${changeDetails}`
      } else if (body.status === 'completed') {
        changeDetails = `Meeting has been marked as completed.`
      } else if (body.status === 'in-progress') {
        changeDetails = `Meeting is now in progress.`
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    // Update meeting
    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', meetingId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating meeting:', updateError)
      throw updateError
    }

    // Send notifications if status changed or important fields were updated
    if (statusChanged || changeDetails || body.scheduled_date || body.start_time) {
      try {
        const participants = currentMeeting.meeting_participants || []
        const participantIds = participants
          .map((p: MeetingParticipant) => p.user_id)
          .filter((id: string) => id !== user.id) // Exclude the updater

        if (participantIds.length > 0) {
          const userEmails: { [key: string]: string } = {}
          const userNames: { [key: string]: string } = {}

          participants.forEach((p: MeetingParticipant) => {
            if (p.user_id !== user.id) {
              userEmails[p.user_id] = p.users?.email || ''
              userNames[p.user_id] = p.users?.name || ''
            }
          })

          const notificationType = body.status === 'cancelled' ? 'cancellation' : body.status === 'rescheduled' ? 'reschedule' : 'update'

          await sendMeetingNotifications({
            meeting_id: meetingId,
            user_ids: participantIds,
            notification_type: notificationType,
            user_emails: userEmails,
            user_names: userNames,
            meeting_data: {
              title: updatedMeeting.title,
              description: updatedMeeting.description,
              scheduled_date: updatedMeeting.scheduled_date,
              start_time: updatedMeeting.start_time,
              end_time: updatedMeeting.end_time,
              meeting_link: updatedMeeting.meeting_link,
              created_by_name: currentMeeting.created_by_user?.name || 'Meeting Organizer',
              status: updatedMeeting.status
            },
            change_details: changeDetails || `Meeting has been updated`
          })
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError)
        // Continue - notification failure shouldn't block update
      }
    }

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      message: 'Meeting updated successfully and participants notified'
    })
  } catch (error: unknown) {
    console.error('Error updating meeting:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update meeting'
    const errorDetails = error && typeof error === 'object' && 'details' in error ? error.details : null

    return NextResponse.json({
      error: errorMessage,
      details: errorDetails
    }, { status: 500 })
  }
}
