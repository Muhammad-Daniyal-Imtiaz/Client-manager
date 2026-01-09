import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface MessageBody {
  receiver_id: string
  receiver_email: string
  subject?: string
  message: string
  attachments?: any[]
}

interface UpdateMessageBody {
  messageId: string
  status: 'read' | 'delivered' | 'archived' | 'deleted'
}

// GET /api/messages - Get messages for current user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationWith = searchParams.get('conversationWith')
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'

    // Use admin client to bypass RLS if needed
    const adminClient = await createAdminClient()

    if (conversationWith) {
      // Get conversation with specific user
      const { data: messages, error } = await adminClient
        .from('messages')
        .select(`
          *,
          sender:sender_id(name, avatar_url),
          receiver:receiver_id(name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationWith}),and(sender_id.eq.${conversationWith},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
        .limit(parseInt(limit))
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

      if (error) {
        // If no messages found or foreign key error, return empty array
        if (error.code === 'PGRST200' || error.code === '42P01') {
          return NextResponse.json({ messages: [] })
        }
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ messages: messages || [] })
    } else {
      // Get all conversations for the user
      const { data: messages, error } = await adminClient
        .from('messages')
        .select(`
          id,
          sender_id,
          sender_email,
          receiver_id,
          receiver_email,
          message,
          status,
          created_at,
          read_at
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        // If no messages found or foreign key error, return empty array
        if (error.code === 'PGRST200' || error.code === '42P01') {
          return NextResponse.json({ conversations: [] })
        }
        console.error('Error fetching conversations:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!messages || messages.length === 0) {
        return NextResponse.json({ conversations: [] })
      }

      // Get user details for all unique users in conversations using admin client
      const userIds = Array.from(new Set([
        ...messages.map(m => m.sender_id),
        ...messages.map(m => m.receiver_id)
      ])).filter(id => id !== user.id)

      let usersMap: Record<string, { name: string; email: string; avatar_url?: string }> = {}
      
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await adminClient
          .from('users')
          .select('id, name, email, avatar_url')
          .in('id', userIds)

        if (!usersError && usersData) {
          usersData.forEach(userData => {
            usersMap[userData.id] = {
              name: userData.name,
              email: userData.email,
              avatar_url: userData.avatar_url
            }
          })
        }
      }

      // Group by conversation
      const conversations = messages.reduce((acc: any, message) => {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id
        
        if (!acc[otherUserId]) {
          const otherUser = usersMap[otherUserId] || {
            name: message.sender_id === user.id ? message.receiver_email : message.sender_email,
            email: message.sender_id === user.id ? message.receiver_email : message.sender_email,
            avatar_url: undefined
          }
          
          acc[otherUserId] = {
            user_id: otherUserId,
            name: otherUser.name,
            email: otherUser.email,
            avatar_url: otherUser.avatar_url,
            last_message: message.message,
            last_message_time: message.created_at,
            unread_count: 0
          }
        }
        
        // Count unread messages (only count the latest for each conversation)
        if (message.receiver_id === user.id && message.status === 'sent' && !message.read_at) {
          acc[otherUserId].unread_count += 1
        }
        
        return acc
      }, {})

      return NextResponse.json({ conversations: Object.values(conversations) })
    }
  } catch (error) {
    console.error('Error in GET /api/messages:', error)
    return NextResponse.json({ conversations: [] })
  }
}

// POST /api/messages - Send a new message
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = await createAdminClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: MessageBody = await request.json()
    const { receiver_id, receiver_email, subject, message, attachments = [] } = body

    if (!receiver_id || !receiver_email || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: receiver_id, receiver_email, and message are required' 
      }, { status: 400 })
    }

    // Validate receiver exists using admin client
    const { data: receiverData, error: receiverError } = await adminClient
      .from('users')
      .select('id, email, name')
      .eq('id', receiver_id)
      .single()

    if (receiverError || !receiverData) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    // Get sender info
    const { data: senderData } = await supabase
      .from('users')
      .select('email, name, avatar_url')
      .eq('id', user.id)
      .single()

    // Create new message using admin client to bypass RLS
    const { data: newMessage, error: messageError } = await adminClient
      .from('messages')
      .insert({
        sender_id: user.id,
        sender_email: senderData?.email || user.email,
        receiver_id,
        receiver_email,
        subject: subject || '',
        message,
        attachments,
        status: 'sent',
        delivered_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }

    // Fetch sender and receiver details separately
    const { data: senderDetails } = await adminClient
      .from('users')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single()

    const { data: receiverDetails } = await adminClient
      .from('users')
      .select('name, avatar_url')
      .eq('id', receiver_id)
      .single()

    const enrichedMessage = {
      ...newMessage,
      sender: senderDetails || { name: senderData?.name || 'Unknown', avatar_url: senderData?.avatar_url || null },
      receiver: receiverDetails || { name: receiverData.name || 'Unknown', avatar_url: null }
    }

    return NextResponse.json({ message: enrichedMessage }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/messages - Update message status
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = await createAdminClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateMessageBody = await request.json()
    const { messageId, status } = body

    if (!messageId || !status) {
      return NextResponse.json({ error: 'Missing required fields: messageId and status are required' }, { status: 400 })
    }

    // First, verify the user is the receiver of this message
    const { data: messageData, error: fetchError } = await adminClient
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !messageData) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (messageData.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this message' }, { status: 403 })
    }

    // Update the message status using admin client
    const updateData: any = { status }
    if (status === 'read' && !messageData.read_at) {
      updateData.read_at = new Date().toISOString()
    }

    const { data: updatedMessage, error: updateError } = await adminClient
      .from('messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating message:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error('Error in PUT /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}