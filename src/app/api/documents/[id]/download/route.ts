import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// In Next.js 14, params is a Promise and needs to be awaited
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
      .select('file_path, client_id, shared_with')
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

    // Verify file exists in storage
    const { data: fileList } = await supabase
      .storage
      .from('client_project_documents')
      .list(document.file_path.split('/').slice(0, -1).join('/'))

    if (!fileList || fileList.length === 0) {
      console.error('File not found in storage at path:', document.file_path)
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 })
    }

    // Generate signed URL (valid for 5 minutes)
    const { data: signedUrl, error: urlError } = await supabase
      .storage
      .from('client_project_documents')
      .createSignedUrl(document.file_path, 300) // 5 minutes

    if (urlError) {
      console.error('Signed URL error:', urlError)
      // Try to get public URL if bucket is public
      const { data: publicUrl } = supabase
        .storage
        .from('client_project_documents')
        .getPublicUrl(document.file_path)
      
      if (publicUrl) {
        return NextResponse.json({ url: publicUrl.publicUrl })
      }
      
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    return NextResponse.json({ url: signedUrl.signedUrl })
  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}