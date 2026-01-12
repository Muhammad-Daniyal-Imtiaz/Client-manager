import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
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

    // Get all clients
    const { data: clients, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        clients!inner (
          company_name
        )
      `)
      .eq('role', 'client')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }

    // Format response
    const formattedClients = clients.map(client => ({
      id: client.id,
      email: client.email,
      name: client.name || client.email.split('@')[0],
      companyName: client.clients?.[0]?.company_name || 'No company'
    }))

    return NextResponse.json({
      success: true,
      clients: formattedClients
    })
  } catch (error) {
    console.error('Admin clients API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}