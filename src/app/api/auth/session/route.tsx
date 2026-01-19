import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // Use getUser() for secure authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Try to get user from database
    const { data: dbUserData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    let userData = dbUserData

    // If user doesn't exist in database but is authenticated, create them
    if (userError && userError.code === 'PGRST116') {
      console.log('User authenticated but not in database, creating user record:', user.email)

      // Create user using admin client with default role
      const { data: createdUser, error: createError } = await adminClient
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'User',
          role: 'client', // Default role
          avatar_url: user.user_metadata?.avatar_url || null,
          phone: user.user_metadata?.phone || null,
          is_active: true,
          is_verified: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (createError) {
        console.error('Error creating user record:', createError)
        // Try to fetch again in case it was created by concurrent request
        const { data: retryUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        userData = retryUser
      } else {
        userData = createdUser
      }

      // Create default role data
      if (userData) {
        try {
          await adminClient.from('clients').insert({
            id: user.id,
            company_name: user.email?.split('@')[0] + "'s Company"
          }).single()
        } catch (err) {
          console.log('Note: Default client data creation skipped')
        }
      }
    }

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ user: null, error: 'Failed to fetch user data' }, { status: 500 })
    }

    if (!userData) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Get role-specific data based on role
    let roleData = null
    try {
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

        case 'full_stack_developer':
          const { data: devData } = await supabase
            .from('full_stack_developers')
            .select('*')
            .eq('id', user.id)
            .single()
          roleData = devData
          break

        case 'lead_full_stack_developer':
          const { data: leadDevData } = await supabase
            .from('lead_full_stack_developers')
            .select('*')
            .eq('id', user.id)
            .single()
          roleData = leadDevData
          break

        case 'admin':
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('id', user.id)
            .single()
          roleData = adminData
          break

        case 'seo_developer':
          const { data: seoData } = await supabase
            .from('seo_developers')
            .select('*')
            .eq('id', user.id)
            .single()
          roleData = seoData
          break

        default:
          break
      }
    } catch (roleError) {
      console.log('Note: Role-specific data not found or not yet created')
    }

    return NextResponse.json({
      user: {
        ...userData,
        roleData
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}