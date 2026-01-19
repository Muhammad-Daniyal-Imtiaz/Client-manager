import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userIds, unshare = false } = body

    if (!Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds must be an array' }, { status: 400 })
    }

    // Use the RPC function to share document
    const { error } = await supabase
      .rpc('share_client_document', {
        document_id: id,
        share_with_user_ids: userIds,
        unshare: unshare
      })

    if (error) {
      console.error('Share error:', error)
      return NextResponse.json({ error: 'Failed to share document' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: unshare ? 'Document unshared successfully' : 'Document shared successfully'
    })
  } catch (error) {
    console.error('Share API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}