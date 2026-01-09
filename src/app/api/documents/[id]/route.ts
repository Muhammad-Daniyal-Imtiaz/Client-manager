import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// GET - Get single document
export async function GET(
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

    // Get document with client info
    const { data: document, error } = await supabase
      .from('client_documents')
      .select(`
        *,
        client:clients(company_name),
        user:users(name, email)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const canView = userData?.role === 'admin' || 
                    document.client_id === user.id || 
                    document.shared_with?.includes(user.id)

    if (!canView) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get signed URL for download
    const { data: signedUrl } = await supabase
      .storage
      .from('client_project_documents')
      .createSignedUrl(document.file_path, 60) // 60 seconds expiry

    return NextResponse.json({ 
      document: {
        ...document,
        downloadUrl: signedUrl?.signedUrl
      }
    })
  } catch (error) {
    console.error('Document API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update document metadata
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const adminClient = await createAdminClient()
    const { id } = params

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description, projectName, tags, isShared } = body

    // First, get the document to check ownership
    const { data: existingDoc } = await supabase
      .from('client_documents')
      .select('client_id')
      .eq('id', id)
      .single()

    if (!existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user is owner or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const canEdit = userData?.role === 'admin' || existingDoc.client_id === user.id

    if (!canEdit) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Update document
    const updateData: any = {
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    if (description !== undefined) updateData.description = description
    if (projectName !== undefined) updateData.project_name = projectName
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())
    if (isShared !== undefined) updateData.is_shared = isShared

    const { data: document, error } = await adminClient
      .from('client_documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      document,
      message: 'Document updated successfully' 
    })
  } catch (error) {
    console.error('Update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete document
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const adminClient = await createAdminClient()
    const { id } = params

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get document to check ownership and get file path
    const { data: document } = await supabase
      .from('client_documents')
      .select('client_id, file_path')
      .eq('id', id)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user is owner or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const canDelete = userData?.role === 'admin' || document.client_id === user.id

    if (!canDelete) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Delete from storage first
    const { error: storageError } = await supabase
      .storage
      .from('client_project_documents')
      .remove([document.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    // Delete from database
    const { error: dbError } = await adminClient
      .from('client_documents')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return NextResponse.json({ error: 'Failed to delete document record' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Document deleted successfully' 
    })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}