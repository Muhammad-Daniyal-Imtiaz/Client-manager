import { createClient, createAdminClient } from './supabase/server'

interface TeamDocumentMetadata {
  description?: string
  projectName?: string
  department?: string
  tags?: string[]
  accessRoles?: string[]
  isShared?: boolean
  sharedWith?: string[]
}

/**
 * Upload a team document
 */
export async function uploadTeamDocument(
  file: File,
  userId: string,
  metadata: TeamDocumentMetadata = {}
): Promise<{
  success: boolean
  document: Record<string, unknown>
  storagePath: string
  databaseFilePath: string
}> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Check if user has team role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    const teamRoles = ['admin', 'project_manager', 'full_stack_developer', 'lead_full_stack_developer']
    if (!userData || !teamRoles.includes(userData.role)) {
      throw new Error('Only team members can upload documents')
    }

    // Generate file path
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uniqueFileName = `${timestamp}_${safeFileName}`

    // Storage path (without bucket name)
    const storagePath = `${userId}/${uniqueFileName}`

    // Database stores full path
    const databaseFilePath = `team_project_documents/${storagePath}`

    console.log('Team upload details:', {
      originalName: file.name,
      storagePath,
      databaseFilePath,
      userId,
      userRole: userData.role,
      fileSize: file.size,
      fileType: file.type
    })

    // Upload to storage
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('team_project_documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Team upload error:', uploadError)
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    console.log('Team storage upload successful:', uploadData)

    // Create database record
    const { data: document, error: dbError } = await adminSupabase
      .from('team_documents')
      .insert({
        uploaded_by: userId,
        file_name: file.name,
        file_path: databaseFilePath,
        file_size: file.size,
        mime_type: file.type,
        description: metadata.description || null,
        project_name: metadata.projectName || null,
        department: metadata.department || null,
        tags: metadata.tags || [],
        is_shared: metadata.isShared || false,
        shared_with: metadata.sharedWith || [],
        access_roles: metadata.accessRoles || null
      })
      .select()
      .single()

    if (dbError) {
      console.error('Team database error:', dbError)
      // Cleanup: Remove uploaded file
      await adminSupabase.storage
        .from('team_project_documents')
        .remove([storagePath])
      throw new Error(`Database insert failed: ${dbError.message}`)
    }

    console.log('Team database record created:', document)

    return {
      success: true,
      document,
      storagePath: storagePath,
      databaseFilePath: databaseFilePath
    }
  } catch (error: unknown) {
    console.error('Team storage helper error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred during upload')
  }
}

/**
 * Get team documents with filters
 */
export async function getTeamDocuments(
  userId: string,
  filters: {
    roleType?: string
    projectName?: string
    department?: string
    search?: string
  } = {}
): Promise<unknown[]> {
  try {
    const supabase = await createClient()

    // Build query parameters
    const params = new URLSearchParams()
    if (filters.roleType) params.append('roleType', filters.roleType)
    if (filters.projectName) params.append('projectName', filters.projectName)
    if (filters.department) params.append('department', filters.department)
    if (filters.search) params.append('search', filters.search)

    // Use RPC function
    const { data: documents, error } = await supabase
      .rpc('get_team_documents', {
        request_user_id: userId,
        filter_role: filters.roleType || null,
        filter_project: filters.projectName || null,
        filter_department: filters.department || null
      })

    if (error) {
      console.error('Error fetching team documents:', error)
      throw new Error('Failed to fetch team documents')
    }

    // Add download URLs to each document
    const documentsWithUrls = await Promise.all(
      (documents || []).map(async (doc: any) => { // Using any temporarily to avoid property access errors on unknown
        try {
          const storagePath = doc.file_path.replace('team_project_documents/', '')
          const { data: signedUrl } = await supabase
            .storage
            .from('team_project_documents')
            .createSignedUrl(storagePath, 60)

          return {
            ...doc,
            download_url: signedUrl?.signedUrl || null
          }
        } catch (urlError) {
          console.error('Error generating URL for team document:', doc.document_id, urlError)
          return {
            ...doc,
            download_url: null
          }
        }
      })
    )

    return documentsWithUrls
  } catch (error: unknown) {
    console.error('Get team documents error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred while fetching team documents')
  }
}

/**
 * Delete team document
 */
export async function deleteTeamDocument(
  documentId: string,
  userId: string
): Promise<{
  success: boolean
  message: string
}> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Get document info
    const { data: document, error: fetchError } = await supabase
      .from('team_documents')
      .select('uploaded_by, file_path')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      throw new Error('Document not found')
    }

    // Check if user is uploader or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    const canDelete = userData?.role === 'admin' || document.uploaded_by === userId

    if (!canDelete) {
      throw new Error('Permission denied')
    }

    // Extract storage path
    const storagePath = document.file_path.replace('team_project_documents/', '')

    // Delete from storage
    const { error: storageError } = await adminSupabase.storage
      .from('team_project_documents')
      .remove([storagePath])

    if (storageError) {
      console.error('Team storage delete error:', storageError)
      throw new Error('Failed to delete file from storage')
    }

    // Delete from database
    const { error: dbError } = await adminSupabase
      .from('team_documents')
      .delete()
      .eq('id', documentId)

    if (dbError) {
      console.error('Team database delete error:', dbError)
      throw new Error('Failed to delete document record')
    }

    return {
      success: true,
      message: 'Document deleted successfully'
    }
  } catch (error: unknown) {
    console.error('Delete team document error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred during deletion')
  }
}

/**
 * Update team document metadata
 */
export async function updateTeamDocument(
  documentId: string,
  userId: string,
  updates: {
    description?: string
    projectName?: string
    department?: string
    tags?: string[]
    isShared?: boolean
    sharedWith?: string[]
    accessRoles?: string[]
  }
): Promise<{
  success: boolean
  document: Record<string, unknown>
}> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Get document info
    const { data: document } = await supabase
      .from('team_documents')
      .select('uploaded_by')
      .eq('id', documentId)
      .single()

    if (!document) {
      throw new Error('Document not found')
    }

    // Check if user is uploader or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    const canEdit = userData?.role === 'admin' || document.uploaded_by === userId

    if (!canEdit) {
      throw new Error('Permission denied')
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.projectName !== undefined) updateData.project_name = updates.projectName
    if (updates.department !== undefined) updateData.department = updates.department
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.isShared !== undefined) updateData.is_shared = updates.isShared
    if (updates.sharedWith !== undefined) updateData.shared_with = updates.sharedWith
    if (updates.accessRoles !== undefined) updateData.access_roles = updates.accessRoles

    // Update document
    const { data: updatedDoc, error: updateError } = await adminSupabase
      .from('team_documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      console.error('Team update error:', updateError)
      throw new Error('Failed to update document')
    }

    return {
      success: true,
      document: updatedDoc
    }
  } catch (error: unknown) {
    console.error('Update team document error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred while updating document')
  }
}

/**
 * Get download URL for team document
 */
export async function getTeamDocumentDownloadUrl(
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
      .from('team_documents')
      .select('file_path, file_name, file_size, mime_type, access_roles, shared_with, uploaded_by')
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

    const hasAccess =
      userData?.role === 'admin' ||
      document.uploaded_by === userId ||
      (document.shared_with && document.shared_with.includes(userId)) ||
      (document.access_roles && document.access_roles.includes(userData?.role))

    if (!hasAccess) {
      throw new Error('Permission denied')
    }

    // Extract storage path
    const storagePath = document.file_path.replace('team_project_documents/', '')

    // Generate signed URL
    const { data: signedUrl, error: urlError } = await supabase
      .storage
      .from('team_project_documents')
      .createSignedUrl(storagePath, 300) // 5 minutes

    if (urlError || !signedUrl) {
      console.error('Team signed URL error:', urlError)
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
    console.error('Get team download URL error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred while getting download URL')
  }
}