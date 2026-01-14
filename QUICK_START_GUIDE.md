# 🚀 Quick Start Guide - Meeting Notifications

## Installation (1 minute)

```bash
npm install nodemailer
```

That's it! Email credentials are already configured.

## Usage Examples

### 1. Create a Meeting (with automatic notifications)

```typescript
import { createMeeting } from '@/lib/meeting-helpers'

// Create meeting
const result = await createMeeting({
  title: 'Team Standup',
  description: 'Daily standup meeting',
  meeting_type_id: 'your-meeting-type-id',
  meeting_link: 'https://meet.google.com/abc-def-ghi',
  scheduled_date: '2026-01-15',
  start_time: '10:00',
  end_time: '10:30',
  participants: ['user-id-1', 'user-id-2']
})

console.log('Meeting created:', result.meeting.id)
// ✅ Email sent to all participants
// ✅ In-app notifications created
// ✅ Database records updated
```

### 2. Update a Meeting

```typescript
import { updateMeeting } from '@/lib/meeting-helpers'

// Update meeting
const result = await updateMeeting(meetingId, {
  title: 'Team Standup - UPDATED',
  start_time: '11:00'
})

// ✅ Participants notified via email
// ✅ In-app notifications created
// ✅ All changes tracked
```

### 3. Cancel a Meeting

```typescript
import { cancelMeeting } from '@/lib/meeting-helpers'

await cancelMeeting(meetingId)
// ✅ Cancellation emails sent
// ✅ All participants notified
```

### 4. Reschedule a Meeting

```typescript
import { rescheduleMeeting } from '@/lib/meeting-helpers'

await rescheduleMeeting(meetingId, '2026-01-20', '14:00')
// ✅ Reschedule emails sent
// ✅ New date/time in notifications
```

### 5. Display Notifications in UI

```tsx
'use client'

import { MeetingNotificationCenter } from '@/components/MeetingNotificationCenter'

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <MeetingNotificationCenter />
    </div>
  )
}
```

### 6. Use Notifications Hook Directly

```tsx
'use client'

import { useMeetingNotifications } from '@/hooks/useMeetingNotifications'
import { toast } from 'sonner'

export function NotificationBadge() {
  const { unreadCount, markAsRead, notifications } = useMeetingNotifications()

  return (
    <div>
      <button className="badge">{unreadCount}</button>
      
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  )
}
```

## What Happens Automatically

### When creating a meeting:
1. ✅ Meeting saved to database
2. ✅ Creator added as host (automatic trigger)
3. ✅ Participants added as attendees
4. ✅ In-app notification created for each participant
5. ✅ HTML email sent to each participant
6. ✅ Email delivery tracked in database

### When updating a meeting:
1. ✅ Meeting details updated
2. ✅ Change detected automatically
3. ✅ In-app notification created
4. ✅ HTML email sent with change details
5. ✅ All participants notified in real-time

### When cancelling a meeting:
1. ✅ Status set to 'cancelled'
2. ✅ Cancellation notification created
3. ✅ Red cancellation emails sent
4. ✅ All participants notified immediately

### Every 5 minutes (with cron):
1. ✅ Check for meetings starting in 15 mins
2. ✅ Send reminder notifications
3. ✅ Reminder emails sent
4. ✅ Reminders marked as sent

## Email Features

All emails include:
- 📧 Professional HTML design
- 🎨 Color-coded by notification type
- 📱 Mobile responsive
- 🔗 Direct "Join Meeting" button
- ⏰ Date, time, and timezone
- 📝 Meeting description
- 🔐 Secure and tracked

## Real-time Features

✨ Notifications appear instantly in the app
🔔 Toast notifications on new messages
📱 Real-time sync across tabs
⚡ No refresh needed
🎯 Automatic unread count

## Email Configuration

Already configured in `.env.local`:
```env
EMAIL_USER=drhomefixerpro@gmail.com
EMAIL_PASS=agbqbuywenzccume
```

## Cron Job Setup

Choose ONE of these options:

### Option 1: Vercel (Recommended)
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/meetings/reminders/cron",
    "schedule": "*/5 * * * *"
  }]
}
```

### Option 2: EasyCron
1. Go to https://www.easycron.com
2. Create new cron job
3. URL: `https://your-app.vercel.app/api/meetings/reminders/cron`
4. Schedule: Every 5 minutes

### Option 3: IFTTT
Set up webhook to cron endpoint every 5 minutes

## Testing

### Test 1: Create a Meeting
```bash
curl -X POST http://localhost:3000/api/meetings/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "meeting_type_id": "type-id",
    "meeting_link": "https://meet.google.com/test",
    "scheduled_date": "2026-01-20",
    "start_time": "14:00",
    "participants": ["user-id-1"]
  }'
```

### Test 2: Check Email
Look in your Gmail inbox for meeting invitation

### Test 3: Check Notifications
Log in to app and see notification appear in real-time

### Test 4: Update Meeting
```bash
curl -X PUT http://localhost:3000/api/meetings/meeting-id/update \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Meeting Title"
  }'
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Emails not sending | Check EMAIL_USER and EMAIL_PASS in .env.local |
| Notifications not appearing | Verify user is logged in, check browser console |
| Reminders not sending | Set up cron job, check database for meetings |
| Slow emails | Email sending is async, check server logs |

## Files Created/Updated

**New Files:**
- ✅ `src/lib/email.ts` - Email service
- ✅ `src/lib/notifications.ts` - Notification manager
- ✅ `src/lib/meeting-helpers.ts` - Helper functions
- ✅ `src/utils/notifications/realtime.ts` - Real-time updates
- ✅ `src/hooks/useMeetingNotifications.ts` - React hook
- ✅ `src/components/MeetingNotificationCenter.tsx` - UI component
- ✅ `src/app/api/meetings/[meetingId]/update/route.ts` - Update API
- ✅ `src/app/api/meetings/reminders/cron/route.ts` - Reminder cron
- ✅ `MEETING_NOTIFICATIONS_SETUP.md` - Full documentation
- ✅ `IMPLEMENTATION_SUMMARY.md` - Implementation details

**Updated Files:**
- ✅ `src/app/api/meetings/create/route.ts` - Added notifications
- ✅ `package.json` - Added nodemailer

## What's Included

✅ **Email Service**
- Nodemailer configuration
- HTML email templates
- Professional styling

✅ **Notification System**
- Database-backed notifications
- In-app notifications
- Email notifications
- Real-time sync

✅ **API Endpoints**
- Create meeting (with invites)
- Update meeting (with notifications)
- Get reminders (cron-ready)

✅ **React Components**
- Notification center
- Real-time updates
- Toast notifications

✅ **Helper Functions**
- Create meeting
- Update meeting
- Cancel meeting
- Reschedule meeting
- Time calculations

✅ **Documentation**
- Full setup guide
- Implementation details
- Troubleshooting guide
- Usage examples

## Next Steps

1. **Install** → `npm install nodemailer`
2. **Test** → Create a meeting and check email
3. **Deploy** → Push to production
4. **Monitor** → Check logs and email delivery
5. **Set Cron** → Configure reminder cron job

## Support

Check files for detailed docs:
- `MEETING_NOTIFICATIONS_SETUP.md` - Complete setup guide
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- Code comments - Implementation details

## All Done! 🎉

Your meeting notification system is ready to use with:
- ✅ Email notifications
- ✅ In-app notifications  
- ✅ Real-time updates
- ✅ Reminder emails
- ✅ Professional HTML templates
- ✅ Full tracking and history

**Start creating meetings and watch the magic happen!** ✨
