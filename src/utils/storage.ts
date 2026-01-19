import { createClient, createAdminClient } from './supabase/server'

/**
 * Upload a document for a client
 * @param file - The file to upload
 * @param userId - The ID of the client user
 * @param metadata - Optional document metadata
 * @returns Upload result with document info
 */
export async function uploadClientDocument(
  file: File,
  userId: string,
  metadata: {
    description?: string
    projectName?: string
    tags?: string[]
  } = {}
): Promise<{
  success: boolean
  document: Record<string, unknown>
  storagePath: string
  databaseFilePath: string
}> {
  try {
    // const supabase = await createClient() // Removed unused variable
    const adminSupabase = await createAdminClient()

    // Generate file path - CRITICAL: Don't include bucket name in the path
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uniqueFileName = `${timestamp}_${safeFileName}`

    // THIS IS THE KEY: Storage path should NOT include bucket name
    const storagePath = `${userId}/${uniqueFileName}`

    // Database stores full path for reference
    const databaseFilePath = `client_project_documents/${storagePath}`

    console.log('Upload details:', {
      originalName: file.name,
      storagePath, // What goes to storage.upload()
      databaseFilePath, // What goes to database
      userId,
      fileSize: file.size,
      fileType: file.type
    })

    // Upload to storage (path without bucket name)
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('client_project_documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    console.log('Storage upload successful:', uploadData)

    // Store in database with full path
    const { data: document, error: dbError } = await adminSupabase
      .from('client_documents')
      .insert({
        client_id: userId,
        file_name: file.name,
        file_path: databaseFilePath, // Store full path
        file_size: file.size,
        mime_type: file.type,
        description: metadata.description || null,
        project_name: metadata.projectName || null,
        tags: metadata.tags || [],
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Cleanup: Remove uploaded file
      await adminSupabase.storage
        .from('client_project_documents')
        .remove([storagePath])
      throw new Error(`Database insert failed: ${dbError.message}`)
    }

    console.log('Database record created successfully:', document)

    return {
      success: true,
      document,
      storagePath: storagePath,
      databaseFilePath: databaseFilePath
    }
  } catch (error: unknown) {
    console.error('Storage helper error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred during upload')
  }
}

/**
 * Delete a client document
 * @param documentId - The ID of the document to delete
 * @param userId - The ID of the user making the request
 * @returns Success status
 */
export async function deleteClientDocument(
  documentId: string,
  userId: string
): Promise<{
  success: boolean
  message: string
}> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // First, get the document to check ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from('client_documents')
      .select('client_id, file_path')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      throw new Error('Document not found')
    }

    // Check if user is owner or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    const canDelete = userData?.role === 'admin' || document.client_id === userId

    if (!canDelete) {
      throw new Error('Permission denied')
    }

    // Extract storage path from database file_path
    const storagePath = document.file_path.replace('client_project_documents/', '')

    // Delete from storage first
    const { error: storageError } = await adminSupabase.storage
      .from('client_project_documents')
      .remove([storagePath])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      throw new Error('Failed to delete file from storage')
    }

    // Delete from database
    const { error: dbError } = await adminSupabase
      .from('client_documents')
      .delete()
      .eq('id', documentId)

    if (dbError) {
      console.error('Database delete error:', dbError)
      throw new Error('Failed to delete document record')
    }

    return {
      success: true,
      message: 'Document deleted successfully'
    }
  } catch (error: unknown) {
    console.error('Delete document error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred during deletion')
  }
}

/**
 * Get download URL for a document
 * @param documentId - The ID of the document
 * @param userId - The ID of the user requesting download
 * @returns Signed URL and file info
 */
export async function getDocumentDownloadUrl(
  documentId: string,
  userId: string
): Promise<{
  url: string
  fileName: string
  fileSize: number
  mimeType: string
  expiresAt: string
}> {
  try {
    const supabase = await createClient()

    // Get document info
    const { data: document, error: docError } = await supabase
      .from('client_documents')
      .select('file_path, client_id, shared_with, file_name, file_size, mime_type')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      throw new Error('Document not found')
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    const canDownload = userData?.role === 'admin' ||
      document.client_id === userId ||
      (document.shared_with && document.shared_with.includes(userId))

    if (!canDownload) {
      throw new Error('Permission denied')
    }

    // Extract storage path
    const storagePath = document.file_path.replace('client_project_documents/', '')

    // Generate signed URL (valid for 5 minutes)
    const { data: signedUrl, error: urlError } = await supabase
      .storage
      .from('client_project_documents')
      .createSignedUrl(storagePath, 300) // 5 minutes

    if (urlError || !signedUrl) {
      console.error('Signed URL error:', urlError)
      throw new Error('Failed to generate download link')
    }

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + 300 * 1000).toISOString()

    return {
      url: signedUrl.signedUrl,
      fileName: document.file_name,
      fileSize: document.file_size,
      mimeType: document.mime_type,
      expiresAt
    }
  } catch (error: unknown) {
    console.error('Get download URL error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred while getting download URL')
  }
}

/**
 * Update document metadata
 * @param documentId - The ID of the document to update
 * @param userId - The ID of the user making the request
 * @param updates - Fields to update
 * @returns Updated document
 */
export async function updateDocumentMetadata(
  documentId: string,
  userId: string,
  updates: {
    description?: string
    projectName?: string
    tags?: string[]
    isShared?: boolean
  }
): Promise<{
  success: boolean
  document: Record<string, unknown>
}> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // First, get document to check ownership
    const { data: existingDoc } = await supabase
      .from('client_documents')
      .select('client_id')
      .eq('id', documentId)
      .single()

    if (!existingDoc) {
      throw new Error('Document not found')
    }

    // Check if user is owner or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    const canEdit = userData?.role === 'admin' || existingDoc.client_id === userId

    if (!canEdit) {
      throw new Error('Permission denied')
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_by: userId,
      updated_at: new Date().toISOString()
    }

    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.projectName !== undefined) updateData.project_name = updates.projectName
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.isShared !== undefined) updateData.is_shared = updates.isShared

    // Update document
    const { data: document, error: updateError } = await adminSupabase
      .from('client_documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error('Failed to update document')
    }

    return {
      success: true,
      document
    }
  } catch (error: unknown) {
    console.error('Update metadata error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred while updating document')
  }
}

/**
 * List documents for a client
 * @param clientId - The ID of the client (or null for current user)
 * @param userId - The ID of the user making the request
 * @returns Array of documents
 */
export async function listClientDocuments(
  clientId: string | null = null,
  userId: string
): Promise<unknown[]> {
  try {
    const supabase = await createClient()

    // Determine target client ID
    const targetClientId = clientId || userId

    // Check if user can view these documents
    if (clientId && clientId !== userId) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userData?.role !== 'admin') {
        throw new Error('Permission denied: Only admins can view other clients\' documents')
      }
    }

    // Get documents using the RPC function
    const { data: documents, error } = await supabase
      .rpc('get_client_documents', { client_uuid: targetClientId })

    if (error) {
      console.error('List documents error:', error)
      throw new Error('Failed to fetch documents')
    }

    // Add download URLs to each document
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc: any) => { // Use any as documents from RPC have complex structure
        try {
          const storagePath = doc.file_path.replace('client_project_documents/', '')
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

    return documentsWithUrls
  } catch (error: unknown) {
    console.error('List documents error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred while listing documents')
  }
}