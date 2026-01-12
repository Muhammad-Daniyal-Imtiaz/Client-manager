import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get document
    const { data: document, error: docError } = await supabase
      .from('team_documents')
      .select('file_path, file_name, file_size, mime_type, access_roles, shared_with, uploaded_by')
      .eq('id', id)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const hasAccess = 
      userData?.role === 'admin' ||
      document.uploaded_by === user.id ||
      (document.shared_with && document.shared_with.includes(user.id)) ||
      (document.access_roles && document.access_roles.includes(userData?.role))

    if (!hasAccess) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Extract storage path
    const storagePath = document.file_path.replace('team_project_documents/', '')

    // Generate signed URL
    const { data: signedUrl, error: urlError } = await supabase
      .storage
      .from('team_project_documents')
      .createSignedUrl(storagePath, 300)

    if (urlError || !signedUrl) {
      console.error('Team signed URL error:', urlError)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    return NextResponse.json({ 
      url: signedUrl.signedUrl,
      fileInfo: {
        name: document.file_name,
        size: document.file_size,
        type: document.mime_type
      }
    })
  } catch (error) {
    console.error('Team download API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}