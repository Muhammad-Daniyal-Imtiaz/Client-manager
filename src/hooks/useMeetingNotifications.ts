// hooks/useMeetingNotifications.ts
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { notificationManager } from '@/utils/notifications/realtime'
import { toast } from 'sonner'

interface MeetingNotification {
  id: string
  meeting_id: string
  user_id: string
  notification_type: 'invitation' | 'reminder' | 'update' | 'cancellation' | 'reschedule'
  title: string
  message: string
  is_read: boolean
  created_at: string
  metadata?: any
}

interface MeetingUpdate {
  type: string
  meeting_id: string
  title: string
  status: string
  old_status: string
  scheduled_date: string
  start_time: string
  meeting_link: string
}

export function useMeetingNotifications() {
  const [notifications, setNotifications] = useState<MeetingNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Initialize real-time notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Initialize real-time manager
        await notificationManager.initialize(user.id)

        // Fetch initial notifications
        const { data: initialNotifications, error } = await supabase
          .from('meeting_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        const notifArray = (initialNotifications || []) as MeetingNotification[]
        setNotifications(notifArray)
        setUnreadCount(notifArray.filter(n => !n.is_read).length)

        // Subscribe to real-time updates
        const unsubscribe = notificationManager.subscribe({
          onNotification: (newNotification: any) => {
            if (newNotification.type === 'meeting_update') {
              // Handle meeting status update
              const statusText = newNotification.status
              const meetingTitle = newNotification.title

              if (newNotification.status === 'cancelled') {
                toast.error(`Meeting Cancelled: ${meetingTitle}`)
              } else if (newNotification.status === 'rescheduled') {
                toast.warning(`Meeting Rescheduled: ${meetingTitle} to ${newNotification.scheduled_date} at ${newNotification.start_time}`)
              } else if (newNotification.status === 'in-progress') {
                toast.info(`${meetingTitle} is now in progress`)
              } else {
                toast.info(`Meeting Updated: ${meetingTitle}`)
              }

              // Refresh notifications list
              refreshNotifications()
            } else if (newNotification.notification_type) {
              // Handle new notification
              setNotifications(prev => [newNotification as MeetingNotification, ...prev])
              setUnreadCount(prev => prev + 1)

              // Show toast based on notification type
              switch (newNotification.notification_type) {
                case 'invitation':
                  toast.success(`New Meeting Invitation: ${newNotification.title}`)
                  break
                case 'reminder':
                  toast.info(`Reminder: ${newNotification.title}`)
                  break
                case 'cancellation':
                  toast.error(`Meeting Cancelled: ${newNotification.title}`)
                  break
                case 'reschedule':
                  toast.warning(`Meeting Rescheduled: ${newNotification.title}`)
                  break
                case 'update':
                  toast.info(`Update: ${newNotification.title}`)
                  break
              }
            }
          },
          onError: (error) => {
            console.error('Real-time notification error:', error)
            toast.error('Failed to sync notifications')
          }
        })

        setIsLoading(false)

        return () => {
          unsubscribe()
          notificationManager.unsubscribe()
        }
      } catch (error) {
        console.error('Error initializing notifications:', error)
        setIsLoading(false)
      }
    }

    initializeNotifications()
  }, [supabase])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from('meeting_notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', notificationId)

        if (error) throw error

        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Error marking notification as read:', error)
        toast.error('Failed to update notification')
      }
    },
    [supabase]
  )

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)

      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('meeting_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds)

      if (error) throw error

      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to update notifications')
    }
  }, [notifications, supabase])

  const refreshNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: updatedNotifications, error } = await supabase
        .from('meeting_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const notifArray = (updatedNotifications || []) as MeetingNotification[]
      setNotifications(notifArray)
      setUnreadCount(notifArray.filter(n => !n.is_read).length)
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    }
  }, [supabase])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  }
}
