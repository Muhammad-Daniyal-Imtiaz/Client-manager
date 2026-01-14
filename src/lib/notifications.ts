import { createClient } from '@/utils/supabase/server'
import { sendEmail, emailTemplates } from '@/lib/email'
import { format } from 'date-fns'

interface MeetingDataType {
  title: string
  description?: string
  scheduled_date: string
  start_time: string
  end_time?: string
  meeting_link: string
  created_by_name?: string
  status?: string
}

interface NotificationPayload {
  meeting_id: string
  user_ids: string[]
  notification_type: 'invitation' | 'reminder' | 'update' | 'cancellation' | 'reschedule'
  user_names?: { [key: string]: string }
  user_emails?: { [key: string]: string }
  meeting_data?: MeetingDataType
  change_details?: string
}

interface EmailRecipient {
  to: string
  name: string
  userId: string
}

interface MeetingRecord {
  id: string
  title: string
  description: string | null
  scheduled_date: string
  start_time: string
  end_time: string | null
  meeting_link: string | null
  status: string
  created_by_user: { name: string; email: string } | null
  meeting_types: { name: string } | null
  meeting_participants: Array<{
    user_id: string
    users: { name: string; email: string } | null
  }> | null
}

export async function sendMeetingNotifications(payload: NotificationPayload): Promise<void> {
  try {
    const supabase = await createClient()

    // Get meeting data if not provided
    let meetingData = payload.meeting_data
    if (!meetingData) {
      const { data: meeting } = await supabase
        .from('meetings')
        .select(
          `
          id, title, description, scheduled_date, start_time, end_time, meeting_link, status,
          created_by_user:users!meetings_created_by_fkey (name, email),
          meeting_types (name)
        `
        )
        .eq('id', payload.meeting_id)
        .single() as { data: MeetingRecord | null; error: any }

      if (meeting) {
        meetingData = {
          title: meeting.title,
          description: meeting.description || undefined,
          scheduled_date: meeting.scheduled_date,
          start_time: meeting.start_time,
          end_time: meeting.end_time || undefined,
          meeting_link: meeting.meeting_link || '',
          created_by_name: meeting.created_by_user?.name || 'Meeting Organizer',
          status: meeting.status
        }
      }
    }

    if (!meetingData) {
      console.error('Could not retrieve meeting data')
      return
    }

    const emailsToSend: EmailRecipient[] = []

    // Get user emails for notification recipients
    for (const userId of payload.user_ids) {
      const email = payload.user_emails?.[userId]
      const name = payload.user_names?.[userId] || 'User'

      if (email) {
        emailsToSend.push({ to: email, name, userId })
      }
    }

    // Create in-app notifications and send emails
    const notificationsToCreate: Array<Promise<any>> = []

    for (const recipient of emailsToSend) {
      // Create notification in database
      const createNotificationPromise = Promise.resolve(
        supabase.from('meeting_notifications').insert({
          meeting_id: payload.meeting_id,
          user_id: recipient.userId,
          notification_type: payload.notification_type,
          title:
            payload.notification_type === 'invitation'
              ? `New Meeting Invitation: ${meetingData.title}`
              : payload.notification_type === 'reminder'
                ? `Reminder: ${meetingData.title}`
                : payload.notification_type === 'cancellation'
                  ? `Meeting Cancelled: ${meetingData.title}`
                  : payload.notification_type === 'reschedule'
                    ? `Meeting Rescheduled: ${meetingData.title}`
                    : `Meeting Update: ${meetingData.title}`,
          message:
            payload.notification_type === 'invitation'
              ? `You have been invited to: ${meetingData.title}`
              : payload.notification_type === 'reminder'
                ? `Reminder: ${meetingData.title} is starting soon`
                : `${meetingData.title} has been ${payload.notification_type}`,
          via_in_app: true,
          metadata: {
            meeting_title: meetingData.title,
            scheduled_date: meetingData.scheduled_date,
            start_time: meetingData.start_time,
            meeting_link: meetingData.meeting_link
          }
        })
      )

      notificationsToCreate.push(createNotificationPromise)

      // Send email based on notification type
      let emailResult: { success: boolean } | undefined
      const dateFormatted = format(new Date(meetingData.scheduled_date), 'MMMM dd, yyyy')

      if (payload.notification_type === 'invitation') {
        const emailPayload = emailTemplates.meetingInvitation({
          participantName: recipient.name,
          meetingTitle: meetingData.title,
          meetingDate: dateFormatted,
          startTime: meetingData.start_time,
          endTime: meetingData.end_time || undefined,
          meetingLink: meetingData.meeting_link || '',
          description: meetingData.description || undefined,
          organizerName: meetingData.created_by_name || 'Meeting Organizer'
        })

        emailResult = await sendEmail({
          to: recipient.to,
          subject: emailPayload.subject,
          html: emailPayload.html
        })
      } else if (payload.notification_type === 'reminder') {
        const emailPayload = emailTemplates.meetingReminder({
          participantName: recipient.name,
          meetingTitle: meetingData.title,
          meetingDate: dateFormatted,
          startTime: meetingData.start_time,
          meetingLink: meetingData.meeting_link || '',
          timeUntilMeeting: '15 minutes'
        })

        emailResult = await sendEmail({
          to: recipient.to,
          subject: emailPayload.subject,
          html: emailPayload.html
        })
      } else if (payload.notification_type === 'cancellation' || payload.notification_type === 'reschedule' || payload.notification_type === 'update') {
        const emailPayload = emailTemplates.meetingUpdate({
          participantName: recipient.name,
          meetingTitle: meetingData.title,
          status: payload.notification_type === 'cancellation' ? 'cancelled' : payload.notification_type === 'reschedule' ? 'rescheduled' : 'updated',
          meetingDate: dateFormatted,
          startTime: meetingData.start_time,
          meetingLink: payload.notification_type !== 'cancellation' ? (meetingData.meeting_link || undefined) : undefined,
          changeDetails: payload.change_details || `Meeting has been ${payload.notification_type}`
        })

        emailResult = await sendEmail({
          to: recipient.to,
          subject: emailPayload.subject,
          html: emailPayload.html
        })
      }

      console.log(`Email sent to ${recipient.to}:`, emailResult?.success)

      // Update notification record to mark email as sent
      if (emailResult?.success) {
        const updatePromise = Promise.resolve(
          supabase
            .from('meeting_notifications')
            .update({
              is_sent: true,
              sent_at: new Date().toISOString(),
              via_email: true
            })
            .eq('meeting_id', payload.meeting_id)
            .eq('user_id', recipient.userId)
            .eq('notification_type', payload.notification_type)
        )

        notificationsToCreate.push(updatePromise)
      }
    }

    // Batch create all notifications
    if (notificationsToCreate.length > 0) {
      await Promise.all(notificationsToCreate)
    }
  } catch (error) {
    console.error('Error sending meeting notifications:', error)
    throw error
  }
}

export async function sendMeetingReminderNotifications(): Promise<void> {
  try {
    const supabase = await createClient()

    // Find meetings starting in 15 minutes
    const now = new Date()
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60000)

    const { data: meetings } = await supabase
      .from('meetings')
      .select(
        `
        id, title, description, scheduled_date, start_time, end_time, meeting_link, status,
        created_by_user:users!meetings_created_by_fkey (name),
        meeting_participants (
          user_id,
          users (name, email)
        )
      `
      )
      .eq('status', 'scheduled')
      .eq('reminder_sent', false)
      .gte('scheduled_date', format(now, 'yyyy-MM-dd'))
      .lte('scheduled_date', format(fifteenMinutesLater, 'yyyy-MM-dd')) as { data: Array<{
        id: string
        title: string
        description: string | null
        scheduled_date: string
        start_time: string
        end_time: string | null
        meeting_link: string | null
        status: string
        created_by_user: { name: string } | null
        meeting_participants: Array<{
          user_id: string
          users: { name: string; email: string } | null
        }> | null
      }> | null; error: any }

    if (meetings && meetings.length > 0) {
      for (const meeting of meetings) {
        const participants = (meeting.meeting_participants || []).map((p) => ({
          userId: p.user_id,
          name: p.users?.name || 'User',
          email: p.users?.email || ''
        }))

        if (participants.length > 0) {
          const userEmails: { [key: string]: string } = {}
          const userNames: { [key: string]: string } = {}

          participants.forEach((p) => {
            userEmails[p.userId] = p.email
            userNames[p.userId] = p.name
          })

          await sendMeetingNotifications({
            meeting_id: meeting.id,
            user_ids: participants.map((p) => p.userId),
            notification_type: 'reminder',
            user_emails: userEmails,
            user_names: userNames,
            meeting_data: {
              title: meeting.title,
              description: meeting.description || undefined,
              scheduled_date: meeting.scheduled_date,
              start_time: meeting.start_time,
              end_time: meeting.end_time || undefined,
              meeting_link: meeting.meeting_link || '',
              created_by_name: meeting.created_by_user?.name
            }
          })

          // Mark reminder as sent
          await supabase
            .from('meetings')
            .update({ reminder_sent: true })
            .eq('id', meeting.id)
        }
      }
    }
  } catch (error) {
    console.error('Error sending meeting reminders:', error)
  }
}
