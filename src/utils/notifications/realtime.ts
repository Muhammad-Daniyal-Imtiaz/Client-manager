// utils/notifications/realtime.ts
import { createClient } from '@/utils/supabase/client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface MeetingNotification {
  id: string
  meeting_id: string
  user_id: string
  notification_type: 'invitation' | 'reminder' | 'update' | 'cancellation' | 'reschedule'
  title: string
  message: string
  is_read: boolean
  via_in_app: boolean
  via_email: boolean
  is_sent: boolean
  sent_at: string | null
  created_at: string
  metadata?: Record<string, any>
}

interface MeetingUpdate {
  id: string
  title: string
  status: string
  scheduled_date: string
  start_time: string
  meeting_link: string | null
}

interface NotificationEvent {
  type: 'meeting_notification' | 'meeting_update'
  meeting_id: string
  title: string
  status?: string
  old_status?: string
  scheduled_date?: string
  start_time?: string
  meeting_link?: string | null
}

interface MeetingNotificationListener {
  onNotification: (notification: NotificationEvent | MeetingNotification) => void
  onError?: (error: Error) => void
}

class NotificationManager {
  private channels: RealtimeChannel[] = []
  private userId: string | null = null
  private listeners: Set<MeetingNotificationListener> = new Set()

  async initialize(userId: string) {
    this.userId = userId
    const supabase = createClient()

    // Subscribe to meeting notifications for the current user
    const notificationChannel = supabase
      .channel(`meeting_notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<MeetingNotification>) => {
          if (payload.new) {
            this.notifyListeners(payload.new as MeetingNotification)
          }
        }
      )
      .on('error', (error: Error) => {
        console.error('Realtime subscription error:', error)
        this.listeners.forEach(listener => {
          listener.onError?.(error)
        })
      })
      .subscribe()

    this.channels.push(notificationChannel)

    // Also subscribe to meeting status changes that affect the user
    const meetingUpdatesChannel = supabase
      .channel(`meeting_updates:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings'
        },
        (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
          // Notify about meeting updates
          const newData = payload.new as MeetingUpdate | null
          const oldData = payload.old as MeetingUpdate | null

          if (newData && oldData) {
            const notification: NotificationEvent = {
              type: 'meeting_update',
              meeting_id: newData.id,
              title: newData.title,
              status: newData.status,
              old_status: oldData.status,
              scheduled_date: newData.scheduled_date,
              start_time: newData.start_time,
              meeting_link: newData.meeting_link
            }
            this.notifyListeners(notification)
          }
        }
      )
      .on('error', (error: Error) => {
        console.error('Meeting updates subscription error:', error)
        this.listeners.forEach(listener => {
          listener.onError?.(error)
        })
      })
      .subscribe()

    this.channels.push(meetingUpdatesChannel)

    return { success: true }
  }

  subscribe(listener: MeetingNotificationListener) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(notification: NotificationEvent | MeetingNotification) {
    this.listeners.forEach(listener => {
      try {
        listener.onNotification(notification)
      } catch (error: unknown) {
        console.error('Error notifying listener:', error)
      }
    })
  }

  unsubscribe() {
    this.channels.forEach(channel => {
      channel.unsubscribe()
    })
    this.channels = []
    this.listeners.clear()
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager()
