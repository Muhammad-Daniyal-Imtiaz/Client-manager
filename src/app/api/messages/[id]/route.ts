import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: {
    id: string
  }
}

// DELETE /api/messages/[id] - Delete a message
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messageId = params.id

    // First, verify the user is either sender or receiver of this message
    const { data: messageData, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !messageData) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (messageData.sender_id !== user.id && messageData.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this message' }, { status: 403 })
    }

    // Soft delete by updating status
    const { data: deletedMessage, error: deleteError } = await supabase
      .from('messages')
      .update({ status: 'deleted' })
      .eq('id', messageId)
      .select()
      .single()

    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ message: deletedMessage })
  } catch (error) {
    console.error('Error in DELETE /api/messages/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}