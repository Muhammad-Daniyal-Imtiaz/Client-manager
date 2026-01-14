// lib/meeting-helpers.ts
import { format, parse } from 'date-fns'

export interface CreateMeetingPayload {
  title: string
  description?: string
  meeting_type_id: string
  meeting_link: string
  scheduled_date: string | Date
  start_time: string
  end_time?: string
  timezone?: string
  notes?: string
  agenda?: any
  participants: string[]
}

export interface UpdateMeetingPayload {
  title?: string
  description?: string
  scheduled_date?: string | Date
  start_time?: string
  end_time?: string
  meeting_link?: string
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled'
  notes?: string
  agenda?: any
}

/**
 * Create a new meeting with notifications
 */
export async function createMeeting(payload: CreateMeetingPayload) {
  const normalizedPayload = {
    ...payload,
    scheduled_date: typeof payload.scheduled_date === 'string' 
      ? payload.scheduled_date 
      : format(payload.scheduled_date, 'yyyy-MM-dd')
  }

  const response = await fetch('/api/meetings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizedPayload)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create meeting')
  }

  return data
}

/**
 * Update an existing meeting with notifications
 */
export async function updateMeeting(meetingId: string, payload: UpdateMeetingPayload) {
  const normalizedPayload = {
    ...payload,
    scheduled_date: payload.scheduled_date
      ? typeof payload.scheduled_date === 'string'
        ? payload.scheduled_date
        : format(payload.scheduled_date, 'yyyy-MM-dd')
      : undefined
  }

  const response = await fetch(`/api/meetings/${meetingId}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizedPayload)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update meeting')
  }

  return data
}

/**
 * Cancel a meeting
 */
export async function cancelMeeting(meetingId: string, reason?: string) {
  return updateMeeting(meetingId, {
    status: 'cancelled'
  })
}

/**
 * Reschedule a meeting
 */
export async function rescheduleMeeting(
  meetingId: string,
  newDate: string | Date,
  newTime: string
) {
  return updateMeeting(meetingId, {
    status: 'rescheduled',
    scheduled_date: typeof newDate === 'string' ? newDate : format(newDate, 'yyyy-MM-dd'),
    start_time: newTime
  })
}

/**
 * Mark meeting as in progress
 */
export async function startMeeting(meetingId: string) {
  return updateMeeting(meetingId, {
    status: 'in-progress'
  })
}

/**
 * Mark meeting as completed
 */
export async function completeMeeting(meetingId: string) {
  return updateMeeting(meetingId, {
    status: 'completed'
  })
}

/**
 * Format meeting date and time for display
 */
export function formatMeetingDateTime(date: string, time: string): string {
  try {
    const dateObj = parse(date, 'yyyy-MM-dd', new Date())
    return format(dateObj, 'MMMM dd, yyyy') + ' at ' + time
  } catch {
    return `${date} at ${time}`
  }
}

/**
 * Check if meeting is in the future
 */
export function isMeetingInFuture(date: string, time: string): boolean {
  try {
    const now = new Date()
    const [hours, minutes] = time.split(':').map(Number)
    const meetingDateTime = new Date(date)
    meetingDateTime.setHours(hours, minutes, 0, 0)
    return meetingDateTime > now
  } catch {
    return false
  }
}

/**
 * Check if meeting is starting soon (within 15 minutes)
 */
export function isMeetingStartingSoon(date: string, time: string): boolean {
  try {
    const now = new Date()
    const [hours, minutes] = time.split(':').map(Number)
    const meetingDateTime = new Date(date)
    meetingDateTime.setHours(hours, minutes, 0, 0)
    
    const diffInMinutes = (meetingDateTime.getTime() - now.getTime()) / (1000 * 60)
    return diffInMinutes > 0 && diffInMinutes <= 15
  } catch {
    return false
  }
}

/**
 * Calculate remaining time until meeting
 */
export function getTimeUntilMeeting(date: string, time: string): string {
  try {
    const now = new Date()
    const [hours, minutes] = time.split(':').map(Number)
    const meetingDateTime = new Date(date)
    meetingDateTime.setHours(hours, minutes, 0, 0)
    
    const diffInMs = meetingDateTime.getTime() - now.getTime()
    
    if (diffInMs <= 0) return 'Meeting has started'
    
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const hours_left = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes_left = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} and ${hours_left} hour${hours_left !== 1 ? 's' : ''}`
    } else if (hours_left > 0) {
      return `${hours_left} hour${hours_left !== 1 ? 's' : ''} and ${minutes_left} minute${minutes_left !== 1 ? 's' : ''}`
    } else {
      return `${minutes_left} minute${minutes_left !== 1 ? 's' : ''}`
    }
  } catch {
    return 'Unknown'
  }
}
