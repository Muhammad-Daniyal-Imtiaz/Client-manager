// src/app/api/auth/callback/route.ts
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'
    const role = requestUrl.searchParams.get('role') || 'client'

    if (!code) {
      console.error('No code provided in callback')
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'no_code')
      return NextResponse.redirect(errorUrl)
    }

    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // Exchange the code for a session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (authError) {
      console.error('Auth callback error:', authError)
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'auth_failed')
      errorUrl.searchParams.set('message', authError.message)
      return NextResponse.redirect(errorUrl)
    }

    if (!session?.user) {
      console.error('No session or user after exchange')
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'no_session')
      return NextResponse.redirect(errorUrl)
    }

    console.log('User authenticated:', session.user.email, 'Role:', role)

    // Check if this is a new user
    const { data: existingUser, error: checkError } = await adminClient
      .from('users')
      .select('id, role')
      .eq('id', session.user.id)
      .single()

    let userRole = role // Use the role from the signup

    if (!existingUser) {
      // New user - create them with the selected role
      userRole = role

      const { error: createError } = await adminClient
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || 
                session.user.user_metadata?.full_name || 
                session.user.email?.split('@')[0] || 
                'User',
          role: role,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          phone: session.user.user_metadata?.phone || null,
          is_active: true,
          is_verified: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (createError) {
        console.error('Error creating user:', createError)
        // Don't fail - user might already exist from another concurrent request
      }

      // Create role-specific data
      try {
        switch (role) {
          case 'client':
            await adminClient.from('clients').insert({
              id: session.user.id,
              company_name: session.user.user_metadata?.name || session.user.email?.split('@')[0] + "'s Company"
            }).single()
            break
          case 'project_manager':
            await adminClient.from('project_managers').insert({
              id: session.user.id,
              department: 'Project Management'
            }).single()
            break
          case 'full_stack_developer':
            await adminClient.from('full_stack_developers').insert({
              id: session.user.id,
              seniority_level: 'mid'
            }).single()
            break
          case 'lead_full_stack_developer':
            await adminClient.from('lead_full_stack_developers').insert({
              id: session.user.id,
              team_size: 3
            }).single()
            break
          case 'admin':
            await adminClient.from('admins').insert({
              id: session.user.id,
              admin_level: 'moderator'
            }).single()
            break
          case 'seo_developer':
            await adminClient.from('seo_developers').insert({
              id: session.user.id,
              seo_specialization: ['On-page SEO']
            }).single()
            break
        }
      } catch (roleError) {
        console.log('Note: Role-specific data creation skipped (might already exist):', roleError)
      }
    } else {
      // Existing user - keep their role
      userRole = existingUser.role

      // Update last_login
      await adminClient
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
    }

    console.log('User session created with role:', userRole)

    // Redirect to dashboard
    const dashUrl = new URL(redirectTo, request.url)
    dashUrl.searchParams.set('role', userRole)

    const response = NextResponse.redirect(dashUrl)
    return response
  } catch (error) {
    console.error('Callback error:', error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'server_error')
    return NextResponse.redirect(errorUrl)
  }
}