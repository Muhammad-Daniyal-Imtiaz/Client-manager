# Meeting Notifications & Email System - Implementation Guide

## Overview
This implementation provides a complete meeting notification system with:
- **Real-time in-app notifications** using Supabase
- **Email notifications** using Nodemailer
- **Meeting status change notifications** (created, updated, cancelled, rescheduled)
- **Automatic meeting reminders** 15 minutes before the meeting starts
- **Database-backed notification history**

## Architecture

### Components

1. **Email Service** (`src/lib/email.ts`)
   - Nodemailer configuration for Gmail
   - HTML email templates for different notification types
   - Sending functionality with error handling

2. **Notification Manager** (`src/lib/notifications.ts`)
   - Core notification logic
   - Database record creation
   - Email sending coordination
   - Reminder scheduling

3. **Real-time Notifications** (`src/utils/notifications/realtime.ts`)
   - Supabase Realtime subscriptions
   - Live meeting updates
   - Real-time notification streaming

4. **API Endpoints**
   - `POST /api/meetings/create` - Creates meeting and sends invitations
   - `PUT /api/meetings/[meetingId]/update` - Updates meeting and notifies participants
   - `GET /api/meetings/reminders/cron` - Cron job for reminder notifications

5. **React Hook** (`src/hooks/useMeetingNotifications.ts`)
   - Frontend integration
   - Real-time listener management
   - Toast notifications

## Setup Instructions

### 1. Install Dependencies

```bash
npm install nodemailer
# or
yarn add nodemailer
```

### 2. Environment Variables

Your `.env.local` already has:
```env
EMAIL_USER=drhomefixerpro@gmail.com
EMAIL_PASS=agbqbuywenzccume
```

For production, also add:
```env
CRON_SECRET=your_secure_cron_secret_here
```

### 3. Database Schema

The SQL schema is already created in your database with:
- `meeting_types` table
- `meetings` table
- `meeting_participants` table
- `meeting_notifications` table
- All required indexes and triggers

### 4. Set Up Cron Job for Reminders

Choose one of these services to trigger the reminder API every 5 minutes:

**Option A: Vercel Crons (Recommended for Vercel deployments)**

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/meetings/reminders/cron",
    "schedule": "*/5 * * * *"
  }]
}
```

**Option B: EasyCron**
1. Go to https://www.easycron.com
2. Create a new cron job
3. URL: `https://your-app.vercel.app/api/meetings/reminders/cron`
4. Schedule: Every 5 minutes
5. Add header: `Authorization: Bearer YOUR_CRON_SECRET`

**Option C: IFTTT**
1. Set up a webhook trigger
2. Point to your cron endpoint
3. Schedule as needed

## Database Tables

### meeting_notifications table columns:
- `id` - UUID primary key
- `meeting_id` - Reference to meeting
- `user_id` - Reference to user receiving notification
- `notification_type` - 'invitation', 'reminder', 'update', 'cancellation', 'reschedule'
- `title` - Notification title
- `message` - Notification message
- `is_read` - Whether user has read the notification
- `is_sent` - Whether email was sent
- `sent_at` - Timestamp when email was sent
- `read_at` - Timestamp when user read it
- `via_email` - Whether sent via email
- `via_in_app` - Whether available in-app
- `metadata` - Additional JSON data
- `created_at` - Creation timestamp

## Usage Examples

### 1. Creating a Meeting (with automatic notifications)

```typescript
const response = await fetch('/api/meetings/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Team Standup',
    description: 'Daily standup meeting',
    meeting_type_id: 'meeting-type-uuid',
    meeting_link: 'https://meet.google.com/abc-def-ghi',
    scheduled_date: '2026-01-15',
    start_time: '10:00',
    end_time: '10:30',
    timezone: 'UTC',
    participants: ['user-id-1', 'user-id-2', 'user-id-3']
  })
})
```

**Automatic Actions:**
- ✅ Meeting created in database
- ✅ Creator added as host
- ✅ Other participants added as attendees
- ✅ In-app notifications created for all participants
- ✅ HTML emails sent to all participants with meeting link
- ✅ Email delivery tracked in database

### 2. Updating a Meeting (with change notifications)

```typescript
const response = await fetch('/api/meetings/[meetingId]/update', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Team Standup - UPDATED',
    status: 'rescheduled',
    scheduled_date: '2026-01-16',
    start_time: '11:00'
  })
})
```

**Automatic Actions:**
- ✅ Meeting updated
- ✅ Notification type set to 'reschedule'
- ✅ In-app notifications created
- ✅ Emails sent to all participants
- ✅ Change details included in notification

### 3. Using Real-time Notifications in Components

```typescript
import { useMeetingNotifications } from '@/hooks/useMeetingNotifications'

export function MeetingNotificationsPanel() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useMeetingNotifications()

  if (isLoading) return <div>Loading notifications...</div>

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <p>{new Date(notif.created_at).toLocaleString()}</p>
        </div>
      ))}
      {unreadCount > 0 && (
        <button onClick={markAllAsRead}>Mark all as read</button>
      )}
    </div>
  )
}
```

## Notification Types

### 1. Meeting Invitation
- **Trigger**: When meeting is created
- **Recipients**: All participants except creator
- **Content**: Meeting details, date, time, link
- **Email Template**: Professional HTML with join button

### 2. Meeting Reminder
- **Trigger**: 15 minutes before meeting start
- **Recipients**: All participants
- **Content**: Quick reminder with join link
- **Frequency**: Once per meeting

### 3. Meeting Update
- **Trigger**: When meeting details are modified (not cancelled/rescheduled)
- **Recipients**: All participants
- **Content**: What was changed, new details

### 4. Meeting Cancellation
- **Trigger**: When status is changed to 'cancelled'
- **Recipients**: All participants
- **Content**: Cancellation notice

### 5. Meeting Rescheduled
- **Trigger**: When status is changed to 'rescheduled'
- **Recipients**: All participants
- **Content**: New date/time, change details

## Email Features

### Templates
Each template has:
- Professional branding
- Color-coded status badges
- Clear meeting details
- Direct action buttons (Join Meeting)
- Mobile-responsive design
- Footer with legal notice

### Delivery Status Tracking
- `is_sent` - Email sent successfully
- `sent_at` - Timestamp of sending
- `read_at` - When user read notification

## Real-time Features

### Live Updates
The `useMeetingNotifications` hook automatically:
1. Connects to Supabase Realtime
2. Listens for new notifications
3. Monitors meeting status changes
4. Shows toast notifications
5. Updates local state instantly

### Meeting Status Changes
When a host updates a meeting status:
- ✅ All participants get real-time update
- ✅ Toast notification appears
- ✅ Meeting details updated
- ✅ Email sent to all participants

## Error Handling

The system includes:
- Fallback email service configurations
- Graceful failure when email service is unavailable
- Notification creation even if email fails
- Error logging for debugging
- User feedback via toast notifications

## Monitoring & Logging

Check server logs for:
```
Email sent: <messageId>
Error sending email: <error details>
Error sending notifications: <error details>
Realtime subscription error: <error details>
```

## Best Practices

1. **Always filter participants**: Creator is automatically added
2. **Use proper timezone**: Set in meeting creation
3. **Monitor cron execution**: Check logs regularly
4. **Test email**: Create a test meeting before production
5. **Verify URLs**: Ensure meeting links are valid
6. **Handle timezones**: Convert dates properly

## Troubleshooting

### Emails not sending
1. Check `EMAIL_USER` and `EMAIL_PASS` in .env
2. Verify Gmail app password is correct
3. Check email server logs
4. Enable "Less secure app access" if needed

### Notifications not showing
1. Verify user is logged in
2. Check browser console for errors
3. Ensure Supabase Realtime is enabled
4. Check `meeting_notifications` table

### Reminders not triggering
1. Verify cron job is configured
2. Check scheduled time is correct
3. Ensure database has meetings with `reminder_sent = false`
4. Check server logs for cron execution

### Participants not receiving invites
1. Verify participant user IDs are correct
2. Check participant emails exist in `users` table
3. Verify email service credentials
4. Check notification records in database

## Production Checklist

- [ ] Email credentials configured
- [ ] Cron job set up and tested
- [ ] Database schema applied
- [ ] .env variables set for production
- [ ] Email templates tested
- [ ] Real-time notifications tested in browser
- [ ] Error logging configured
- [ ] Backup email service considered
- [ ] Database backups configured
- [ ] Monitoring alerts set up

## API Response Examples

### Meeting Creation Success
```json
{
  "success": true,
  "message": "Meeting created successfully and invitations sent",
  "meeting": {
    "id": "uuid",
    "title": "Team Standup",
    "scheduled_date": "2026-01-15",
    "start_time": "10:00"
  }
}
```

### Meeting Update Success
```json
{
  "success": true,
  "message": "Meeting updated successfully and participants notified",
  "meeting": {
    "id": "uuid",
    "title": "Team Standup",
    "status": "rescheduled"
  }
}
```

## Future Enhancements

1. SMS notifications via Twilio
2. Calendar integration (Google Calendar, Outlook)
3. Recurring meetings support
4. Custom notification schedules
5. Do Not Disturb hours
6. Meeting feedback surveys
7. Attendance tracking
8. Meeting recordings notification

## Support

For issues or questions:
1. Check server logs
2. Verify database schema
3. Test API endpoints directly
4. Check email configuration
5. Review Supabase Realtime status
