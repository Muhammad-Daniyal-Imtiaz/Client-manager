// app/maindashboards/Admin/meetings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  Users,
  Clock,
  Video,
  CheckCircle,
  Bell,
  Eye,
  ExternalLink,
  Search,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Meeting {
  id: string
  title: string
  description: string
  meeting_type: string
  meeting_link: string
  scheduled_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  timezone: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled'
  notes: string
  agenda: unknown
  created_by_name: string
  created_by_email: string
  participant_count: number
  my_role: string
  my_status: string
  created_at: string
}

interface MeetingParticipant {
  id: string
  name: string
  email: string
  role: string
  invitation_status: string
  attendance_status: string
}

interface MeetingNotification {
  id: string
  title: string
  message: string
  notification_type: string
  is_read: boolean
  created_at: string
  meeting: {
    id: string
    title: string
    scheduled_date: string
    start_time: string
    meeting_link: string
  }
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [notifications, setNotifications] = useState<MeetingNotification[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [meetingParticipants, setMeetingParticipants] = useState<MeetingParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('meetings')

  useEffect(() => {
    if (activeTab === 'meetings') {
      fetchMeetings()
    } else if (activeTab === 'notifications') {
      fetchNotifications()
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedMeeting) {
      fetchMeetingParticipants(selectedMeeting.id)
    }
  }, [selectedMeeting])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/meetings/user')
      const data = await response.json()

      if (data.meetings) {
        setMeetings(data.meetings)
      } else {
        setMeetings([])
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    setNotificationsLoading(true)
    try {
      const response = await fetch('/api/meetings/notifications')
      const data = await response.json()

      if (data.notifications) {
        setNotifications(data.notifications)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setNotificationsLoading(false)
    }
  }

  const fetchMeetingParticipants = async (meetingId: string) => {
    setParticipantsLoading(true)
    try {
      const response = await fetch(`/api/meetings/${meetingId}/participants`)
      const data = await response.json()

      if (data.participants) {
        setMeetingParticipants(data.participants)
      } else {
        setMeetingParticipants([])
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast.error('Failed to load participants')
    } finally {
      setParticipantsLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/meetings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: [notificationId],
          markAsRead: true
        })
      })

      const data = await response.json()
      if (data.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, is_read: true }
              : notif
          )
        )
        toast.success('Notification marked as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to update notification')
    }
  }

  const markAllNotificationsAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    try {
      const response = await fetch('/api/meetings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: unreadIds,
          markAsRead: true
        })
      })

      const data = await response.json()
      if (data.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, is_read: true }))
        )
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      toast.error('Failed to update notifications')
    }
  }

  const joinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank', 'noopener,noreferrer')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'rescheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'tentative': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'invitation': return 'bg-blue-100 text-blue-800'
      case 'reminder': return 'bg-yellow-100 text-yellow-800'
      case 'update': return 'bg-purple-100 text-purple-800'
      case 'cancellation': return 'bg-red-100 text-red-800'
      case 'reschedule': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.meeting_type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings & Notifications</h1>
          <p className="text-gray-600 mt-2">Manage and view all your meetings and notifications</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={activeTab === 'meetings' ? fetchMeetings : fetchNotifications}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {activeTab === 'notifications' && unreadCount > 0 && (
            <Button onClick={markAllNotificationsAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Meetings
            <Badge variant="secondary" className="ml-1">
              {meetings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount} new
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search meetings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meetings List */}
          {loading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3">Loading meetings...</span>
                </div>
              </CardContent>
            </Card>
          ) : filteredMeetings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'You have no scheduled meetings'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Meetings List */}
              <div className="lg:col-span-2 space-y-4">
                {filteredMeetings.map(meeting => (
                  <Card
                    key={meeting.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedMeeting?.id === meeting.id ? 'ring-2 ring-primary' : ''
                      }`}
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {meeting.title}
                            </h3>
                            <Badge className={getStatusColor(meeting.status)}>
                              {meeting.status.replace('-', ' ')}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(meeting.scheduled_date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{meeting.start_time} {meeting.end_time && `- ${meeting.end_time}`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{meeting.participant_count} participants</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                            {meeting.description || 'No description provided'}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {meeting.meeting_type}
                            </Badge>
                            <Badge variant="outline">
                              My Role: {meeting.my_role}
                            </Badge>
                            <Badge className={getInvitationStatusColor(meeting.my_status)}>
                              {meeting.my_status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              joinMeeting(meeting.meeting_link)
                            }}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(meeting.meeting_link, '_blank', 'noopener,noreferrer')
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Link
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Meeting Details Sidebar */}
              <div className="space-y-6">
                {selectedMeeting ? (
                  <>
                    {/* Meeting Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Meeting Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Created By</h4>
                          <p className="text-sm">{selectedMeeting.created_by_name}</p>
                          <p className="text-xs text-gray-500">{selectedMeeting.created_by_email}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Timezone</h4>
                          <p className="text-sm">{selectedMeeting.timezone}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Duration</h4>
                          <p className="text-sm">
                            {selectedMeeting.duration_minutes
                              ? `${selectedMeeting.duration_minutes} minutes`
                              : 'Not specified'
                            }
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Created On</h4>
                          <p className="text-sm">
                            {format(new Date(selectedMeeting.created_at), 'PPpp')}
                          </p>
                        </div>

                        {selectedMeeting.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {selectedMeeting.notes}
                            </p>
                          </div>
                        )}

                        {!!selectedMeeting.agenda && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Agenda</h4>
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto p-2 bg-gray-50 rounded">
                              {JSON.stringify(selectedMeeting.agenda, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Participants */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Participants</span>
                          <Badge variant="secondary">
                            {meetingParticipants.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {participantsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        ) : meetingParticipants.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No participants found</p>
                        ) : (
                          <div className="space-y-3">
                            {meetingParticipants.map(participant => (
                              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">{participant.name}</p>
                                  <p className="text-xs text-gray-500">{participant.email}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge className={getInvitationStatusColor(participant.invitation_status)}>
                                    {participant.invitation_status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {participant.role}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Meeting</h3>
                      <p className="text-gray-600">
                        Click on a meeting to view details and participants
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          {notificationsLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3">Loading notifications...</span>
                </div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? 'No notifications match your search'
                    : 'You have no meeting notifications'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <Card
                  key={notification.id}
                  className={`${!notification.is_read ? 'border-primary/20 bg-primary/5' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <Badge className={getNotificationTypeColor(notification.notification_type)}>
                            {notification.notification_type}
                          </Badge>
                          {!notification.is_read && (
                            <Badge variant="default" className="animate-pulse">
                              New
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                          {notification.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span>
                            {format(new Date(notification.created_at), 'PPpp')}
                          </span>
                          {notification.meeting && (
                            <>
                              <span>•</span>
                              <span className="font-medium">{notification.meeting.title}</span>
                              <span>•</span>
                              <span>
                                {format(new Date(notification.meeting.scheduled_date), 'MMM d')} at {notification.meeting.start_time}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Read
                          </Button>
                        )}

                        {notification.meeting?.meeting_link && (
                          <Button
                            size="sm"
                            onClick={() => joinMeeting(notification.meeting.meeting_link)}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}