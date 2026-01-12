import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()
    const { id } = await params

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get document
    const { data: document } = await supabase
      .from('team_documents')
      .select('uploaded_by, file_path')
      .eq('id', id)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const canDelete = userData?.role === 'admin' || document.uploaded_by === user.id

    if (!canDelete) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Extract storage path
    const storagePath = document.file_path.replace('team_project_documents/', '')

    // Delete from storage
    const { error: storageError } = await adminSupabase.storage
      .from('team_project_documents')
      .remove([storagePath])

    if (storageError) {
      console.error('Team storage delete error:', storageError)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    // Delete from database
    const { error: dbError } = await adminSupabase
      .from('team_documents')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('Team database delete error:', dbError)
      return NextResponse.json({ error: 'Failed to delete document record' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Team document deleted successfully' 
    })
  } catch (error) {
    console.error('Team delete API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}