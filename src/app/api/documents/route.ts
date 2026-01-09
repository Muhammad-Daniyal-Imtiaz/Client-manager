import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET - Get all documents for current client (NO params here!)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is client or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let targetClientId = user.id
    if (clientId && userData.role === 'admin') {
      // Admin can view any client's documents
      targetClientId = clientId
    } else if (clientId && clientId !== user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get documents using the function
    const { data: documents, error } = await supabase
      .rpc('get_client_documents', { client_uuid: targetClientId })

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Generate download URLs for each document
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc: any) => {
        try {
          // Extract storage path
          let storagePath = doc.file_path
          if (storagePath.startsWith('client_project_documents/')) {
            storagePath = storagePath.replace('client_project_documents/', '')
          }
          
          const { data: signedUrl } = await supabase
            .storage
            .from('client_project_documents')
            .createSignedUrl(storagePath, 60) // 1 minute for list view
          
          return {
            ...doc,
            download_url: signedUrl?.signedUrl || null
          }
        } catch (urlError) {
          console.error('Error generating URL for document:', doc.document_id, urlError)
          return {
            ...doc,
            download_url: null
          }
        }
      })
    )

    return NextResponse.json({ 
      success: true,
      documents: documentsWithUrls 
    })
  } catch (error) {
    console.error('Documents API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Upload a new document
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string
    const projectName = formData.get('projectName') as string
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check if user is client
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'client') {
      return NextResponse.json({ error: 'Only clients can upload documents' }, { status: 403 })
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // Parse tags
    const parsedTags = tags ? tags.split(',').map((tag: string) => tag.trim()) : []

    // Use the helper function
    const { uploadClientDocument } = await import('@/utils/storage')
    
    const result = await uploadClientDocument(file, user.id, {
      description: description || undefined,
      projectName: projectName || undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined
    })

    return NextResponse.json({ 
      success: true, 
      document: result.document,
      message: 'Document uploaded successfully' 
    })
  } catch (error: unknown) {
    console.error('Upload API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 })
  }
}