// app/api/meetings/reminders/cron/route.ts
import { sendMeetingReminderNotifications } from '@/lib/notifications'
import { NextResponse } from 'next/server'

// This route should be called by a cron job service (e.g., Vercel Crons, EasyCron, etc.)
// Every 5 minutes to check for meetings starting in 15 minutes

export async function GET(request: Request) {
  try {
    // Optional: Verify the request is from your cron service
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Send reminder notifications
    await sendMeetingReminderNotifications()

    return NextResponse.json({
      success: true,
      message: 'Meeting reminders sent successfully'
    })
  } catch (error: any) {
    console.error('Error sending meeting reminders:', error)
    return NextResponse.json({
      error: error.message || 'Failed to send reminders',
      details: error.details || null
    }, { status: 500 })
  }
}
