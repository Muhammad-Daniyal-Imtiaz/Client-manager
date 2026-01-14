// components/MeetingNotificationCenter.tsx
'use client'

import { useState } from 'react'
import { useMeetingNotifications } from '@/hooks/useMeetingNotifications'
import { format } from 'date-fns'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function MeetingNotificationCenter() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useMeetingNotifications()
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null)

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'invitation':
        return 'bg-blue-100 text-blue-800'
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800'
      case 'update':
        return 'bg-purple-100 text-purple-800'
      case 'cancellation':
        return 'bg-red-100 text-red-800'
      case 'reschedule':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invitation':
        return '📧'
      case 'reminder':
        return '⏰'
      case 'cancellation':
        return '❌'
      case 'reschedule':
        return '📅'
      case 'update':
        return '📝'
      default:
        return '📢'
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Meeting Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading notifications...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Meeting Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <CardDescription>Stay updated on meeting changes and reminders</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id)
                  }
                  setExpandedNotification(
                    expandedNotification === notification.id ? null : notification.id
                  )
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xl mt-1">{getNotificationIcon(notification.notification_type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        <Badge className={`${getNotificationColor(notification.notification_type)} text-xs`}>
                          {notification.notification_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      {expandedNotification === notification.id && notification.metadata && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
                          {notification.metadata.meeting_title && (
                            <p>
                              <span className="font-semibold">Meeting:</span> {notification.metadata.meeting_title}
                            </p>
                          )}
                          {notification.metadata.scheduled_date && (
                            <p>
                              <span className="font-semibold">Date:</span> {notification.metadata.scheduled_date}
                            </p>
                          )}
                          {notification.metadata.start_time && (
                            <p>
                              <span className="font-semibold">Time:</span> {notification.metadata.start_time}
                            </p>
                          )}
                          {notification.metadata.meeting_link && (
                            <p>
                              <a
                                href={notification.metadata.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Join Meeting
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(notification.created_at), 'MMM dd, yyyy p')}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2">
                    {notification.is_read ? (
                      <CheckCheck className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
