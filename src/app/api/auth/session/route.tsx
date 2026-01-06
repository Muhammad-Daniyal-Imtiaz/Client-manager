import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Get user with role-specific data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Get role-specific data based on role
    let roleData = null
    switch (userData.role) {
      case 'client':
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', user.id)
          .single()
        roleData = clientData
        break
      
      case 'project_manager':
        const { data: pmData } = await supabase
          .from('project_managers')
          .select('*')
          .eq('id', user.id)
          .single()
        roleData = pmData
        break
      
      // Add other role cases...
      
      default:
        break
    }

    return NextResponse.json({ 
      user: {
        ...userData,
        roleData
      }
    })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}