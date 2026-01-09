import { createClient, createAdminClient } from './supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

export async function uploadClientDocument(
  file: File,
  userId: string,
  metadata: {
    description?: string
    projectName?: string
    tags?: string[]
  } = {}
) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Generate file path
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`
    const filePath = `client_project_documents/${userId}/${uniqueFileName}`

    // Method 1: Try with regular client first
    let uploadResult = await supabase.storage
      .from('client_project_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    // Method 2: If fails due to RLS, try with admin client
    if (uploadResult.error?.message?.includes('row-level security')) {
      console.log('RLS violation detected, retrying with admin client...')
      uploadResult = await adminSupabase.storage
        .from('client_project_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
    }

    if (uploadResult.error) {
      throw new Error(`Storage upload failed: ${uploadResult.error.message}`)
    }

    // Create database record
    const { data: document, error: dbError } = await adminSupabase
      .from('client_documents')
      .insert({
        client_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        description: metadata.description,
        project_name: metadata.projectName,
        tags: metadata.tags || [],
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()

    if (dbError) {
      // Clean up: delete uploaded file
      await adminSupabase.storage
        .from('client_project_documents')
        .remove([filePath])
      throw new Error(`Database insert failed: ${dbError.message}`)
    }

    return {
      success: true,
      document,
      filePath
    }
  } catch (error: unknown) {
    console.error('Storage helper error:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred during upload')
  }
}