import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const clientId = searchParams.get('clientId') || ''
    const projectName = searchParams.get('projectName') || ''
    const tags = searchParams.get('tags') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    console.log('Admin documents query:', {
      search, clientId, projectName, tags, startDate, endDate, page, limit
    })

    // Method 1: Get documents with client info
    let query = supabase
      .from('client_documents')
      .select(`
        *,
        clients!inner (
          company_name,
          company_size,
          industry,
          client_since
        )
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (projectName) {
      query = query.ilike('project_name', `%${projectName}%`)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Add sorting and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Execute query
    const { data: documents, error, count } = await query

    if (error) {
      console.error('Error fetching admin documents:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch documents',
        details: error.message 
      }, { status: 500 })
    }

    console.log('Found documents:', documents?.length)

    // If we have documents, get the user info for each client
    let documentsWithUserInfo: any[] = []
    
    if (documents && documents.length > 0) {
      // Get all unique client IDs
      const clientIds = [...new Set(documents.map(doc => doc.client_id))]
      
      // Get user info for these clients
      const { data: users } = await supabase
        .from('users')
        .select('id, email, name, phone, country')
        .in('id', clientIds)
      
      // Create a map for quick lookup
      const userMap = new Map()
      users?.forEach(user => userMap.set(user.id, user))
      
      // Combine document data with user info
      documentsWithUserInfo = documents.map(doc => {
        const userInfo = userMap.get(doc.client_id) || {}
        const clientInfo = doc.clients || {}
        
        return {
          ...doc,
          client: clientInfo,
          user: userInfo
        }
      })
    }

    // Get download URLs for each document
    const documentsWithUrls = await Promise.all(
      documentsWithUserInfo.map(async (doc: any) => {
        try {
          // Extract storage path
          let storagePath = doc.file_path
          if (storagePath.startsWith('client_project_documents/')) {
            storagePath = storagePath.replace('client_project_documents/', '')
          }
          
          const { data: signedUrl } = await supabase
            .storage
            .from('client_project_documents')
            .createSignedUrl(storagePath, 300) // 5 minutes
          
          return {
            ...doc,
            download_url: signedUrl?.signedUrl || null
          }
        } catch (urlError) {
          console.error('Error generating URL for document:', doc.id, urlError)
          return {
            ...doc,
            download_url: null
          }
        }
      })
    )

    // Get statistics
    const { count: totalDocuments } = await supabase
      .from('client_documents')
      .select('*', { count: 'exact', head: true })

    const { count: totalClients } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'client')

    return NextResponse.json({
      success: true,
      documents: documentsWithUrls,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      statistics: {
        totalDocuments: totalDocuments || 0,
        totalClients: totalClients || 0,
        documentsPerClient: totalClients ? Math.round((totalDocuments || 0) / totalClients) : 0
      },
      filters: {
        search,
        clientId,
        projectName,
        tags,
        startDate,
        endDate
      }
    })
  } catch (error) {
    console.error('Admin documents API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}