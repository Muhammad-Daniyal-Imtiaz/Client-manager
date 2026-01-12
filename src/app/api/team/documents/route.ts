import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has team role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const teamRoles = ['admin', 'project_manager', 'full_stack_developer', 'lead_full_stack_developer']
    if (!userData || !teamRoles.includes(userData.role)) {
      return NextResponse.json({ error: 'Team access required' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const roleType = searchParams.get('roleType') || ''
    const projectName = searchParams.get('projectName') || ''
    const department = searchParams.get('department') || ''

    // Build query
    let query = supabase
      .from('team_documents')
      .select(`
        *,
        users!team_documents_uploaded_by_fkey (
          id,
          email,
          name,
          role
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (roleType) {
      query = query.eq('role_type', roleType)
    }

    if (projectName) {
      query = query.ilike('project_name', `%${projectName}%`)
    }

    if (department) {
      query = query.ilike('department', `%${department}%`)
    }

    // Execute query
    const { data: documents, error } = await query

    if (error) {
      console.error('Error fetching team documents:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch team documents',
        details: error.message 
      }, { status: 500 })
    }

    // Format response
    const formattedDocuments = (documents || []).map(doc => ({
      document_id: doc.id,
      file_name: doc.file_name,
      file_path: doc.file_path,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      description: doc.description,
      role_type: doc.role_type,
      project_name: doc.project_name,
      department: doc.department,
      tags: doc.tags || [],
      is_shared: doc.is_shared,
      access_roles: doc.access_roles || [],
      uploaded_by: doc.uploaded_by,
      uploader_name: doc.users?.name || 'Unknown',
      uploader_email: doc.users?.email || '',
      uploader_role: doc.users?.role || 'unknown',
      created_at: doc.created_at,
      updated_at: doc.updated_at
    }))

    return NextResponse.json({
      success: true,
      documents: formattedDocuments
    })
  } catch (error) {
    console.error('Team documents API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has team role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const teamRoles = ['admin', 'project_manager', 'full_stack_developer', 'lead_full_stack_developer']
    if (!userData || !teamRoles.includes(userData.role)) {
      return NextResponse.json({ error: 'Team access required' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string
    const projectName = formData.get('projectName') as string
    const department = formData.get('department') as string
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    if (file.size > 50 * 1024 * 1024) { // 50MB
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/gif',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', 'application/x-rar-compressed',
      'application/x-7z-compressed'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // Generate file path
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uniqueFileName = `${timestamp}_${safeFileName}`
    const storagePath = `${user.id}/${uniqueFileName}`
    const databaseFilePath = `team_project_documents/${storagePath}`

    // Upload file
    const { error: uploadError } = await adminSupabase.storage
      .from('team_project_documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Team upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : []

    // Create document record
    const { data: document, error: dbError } = await adminSupabase
      .from('team_documents')
      .insert({
        uploaded_by: user.id,
        file_name: file.name,
        file_path: databaseFilePath,
        file_size: file.size,
        mime_type: file.type,
        description: description || null,
        project_name: projectName || null,
        department: department || null,
        tags: parsedTags.length > 0 ? parsedTags : null
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: delete uploaded file
      await adminSupabase.storage
        .from('team_project_documents')
        .remove([storagePath])
      
      console.error('Team database error:', dbError)
      return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      document,
      message: 'Team document uploaded successfully' 
    })
  } catch (error) {
    console.error('Team upload API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}