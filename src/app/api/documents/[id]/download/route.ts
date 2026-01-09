import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params // Await params here

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get document including file_path
    const { data: document, error: docError } = await supabase
      .from('client_documents')
      .select('file_path, client_id, shared_with, file_name, mime_type, file_size')
      .eq('id', id)
      .single()

    if (docError || !document) {
      console.error('Document not found:', docError)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const canDownload = userData?.role === 'admin' || 
                        document.client_id === user.id || 
                        (document.shared_with && document.shared_with.includes(user.id))

    if (!canDownload) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Extract the path within the bucket
    let storagePath = document.file_path
    if (storagePath.startsWith('client_project_documents/')) {
      storagePath = storagePath.replace('client_project_documents/', '')
    }

    console.log('Download request:', {
      documentId: id,
      storagePath,
      userId: user.id,
      userRole: userData?.role
    })

    // Generate signed URL (valid for 5 minutes)
    const { data: signedUrl, error: urlError } = await supabase
      .storage
      .from('client_project_documents')
      .createSignedUrl(storagePath, 300)

    if (urlError || !signedUrl) {
      console.error('Signed URL error:', urlError)
      
      // Fallback to public URL if available
      const { data: publicUrl } = supabase
        .storage
        .from('client_project_documents')
        .getPublicUrl(storagePath)
      
      if (publicUrl?.publicUrl) {
        return NextResponse.json({ 
          url: publicUrl.publicUrl,
          fileInfo: {
            name: document.file_name,
            size: document.file_size,
            type: document.mime_type
          }
        })
      }
      
      return NextResponse.json({ 
        error: 'Failed to generate download link',
        details: urlError?.message || 'Unknown error'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      url: signedUrl.signedUrl,
      fileInfo: {
        name: document.file_name,
        size: document.file_size,
        type: document.mime_type,
        path: document.file_path
      },
      expiresIn: 300
    })
  } catch (error) {
    console.error('Download API error:', error)
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}