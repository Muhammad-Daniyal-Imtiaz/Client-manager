// components/meetings/MeetingScheduler.tsx
'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Link, Video, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface MeetingType {
  id: string
  name: string
  description: string
}

export default function MeetingScheduler() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meetingType, setMeetingType] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setFetching(true)
    try {
      await Promise.all([fetchUsers(), fetchMeetingTypes()])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data. Please refresh the page.')
    } finally {
      setFetching(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/list')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      // Fallback dummy users for testing
      setUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'client' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'developer' }
      ])
    }
  }

  const fetchMeetingTypes = async () => {
    try {
      const response = await fetch('/api/meetings/types')
      if (!response.ok) throw new Error('Failed to fetch meeting types')
      const data = await response.json()
      setMeetingTypes(data.types || [])
    } catch (error) {
      console.error('Error fetching meeting types:', error)
      // Fallback meeting types
      setMeetingTypes([
        { id: 'client-meeting', name: 'Client Meeting', description: 'Meeting with clients' },
        { id: 'team-meeting', name: 'Team Meeting', description: 'Internal team meeting' },
        { id: 'project-review', name: 'Project Review', description: 'Project status review' },
        { id: 'planning-session', name: 'Planning Session', description: 'Project planning meeting' },
        { id: 'training-session', name: 'Training Session', description: 'Team training meeting' },
        { id: 'one-on-one', name: 'One-on-One', description: 'Individual meeting' }
      ])
    }
  }

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const generateMeetingLink = () => {
    const meetingId = Math.random().toString(36).substring(2, 15)
    const platforms = [
      `https://meet.google.com/${meetingId}`,
      `https://zoom.us/j/${meetingId}`,
      `https://teams.microsoft.com/l/meetup-join/${meetingId}`
    ]
    const randomLink = platforms[Math.floor(Math.random() * platforms.length)]
    setMeetingLink(randomLink)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!title.trim()) {
      return
    }
    
    if (!meetingType) {
      return
    }
    
    if (!meetingLink.trim()) {
      return
    }
    
    if (!date) {
      return
    }
    
    if (!startTime) {
      return
    }
    
    if (selectedUsers.length === 0) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          meeting_type_id: meetingType,
          meeting_link: meetingLink.trim(),
          scheduled_date: format(date, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime || null,
          participants: selectedUsers
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Reset form
        setTitle('')
        setDescription('')
        setMeetingType('')
        setMeetingLink('')
        setDate(undefined)
        setStartTime('')
        setEndTime('')
        setSelectedUsers([])
      }
    } catch (error: any) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading meeting scheduler...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Schedule New Meeting
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Meeting Title *</label>
              <Input
                placeholder="Team Standup, Client Review, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meeting Type *</label>
              <Select 
                value={meetingType} 
                onValueChange={setMeetingType} 
                required
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select meeting type">
                    {meetingType ? (
                      meetingTypes.find(t => t.id === meetingType)?.name || meetingType
                    ) : (
                      "Select meeting type"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      <div className="flex flex-col">
                        <span>{type.name}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Meeting agenda, topics to discuss..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </label>
              <Popover>
                <PopoverTrigger asChild disabled={loading}>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={loading}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time *
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Time (Optional)</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4" />
              Meeting Link *
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                required
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateMeetingLink}
                disabled={loading}
              >
                Generate Link
              </Button>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants *
            </label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found. Please try refreshing.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedUsers.includes(user.id)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-gray-50",
                        loading && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !loading && handleUserSelect(user.id)}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Selected: {selectedUsers.length} participant{selectedUsers.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={loading || meetingTypes.length === 0 || users.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Scheduling...' : 'Schedule Meeting'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}