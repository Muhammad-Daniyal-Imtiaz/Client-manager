// src/app/api/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server'
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

    // Create or update user in our database
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || 
              session.user.user_metadata?.full_name || 
              session.user.email?.split('@')[0] || 
              'User',
        role: role,
        avatar_url: session.user.user_metadata?.avatar_url,
        phone: session.user.user_metadata?.phone || null,
        is_active: true,
        is_verified: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (dbError) {
      console.error('Database error creating user:', dbError)
      // Don't fail the auth flow, just log the error
      // User can still proceed to dashboard
    }

    // Create role-specific data
    try {
      switch (role) {
        case 'client':
          await supabase
            .from('clients')
            .upsert({
              id: session.user.id,
              company_name: session.user.user_metadata?.company || session.user.email?.split('@')[0] + "'s Company"
            }, { onConflict: 'id' })
          break
        case 'project_manager':
          await supabase
            .from('project_managers')
            .upsert({
              id: session.user.id,
              department: 'Project Management'
            }, { onConflict: 'id' })
          break
        case 'full_stack_developer':
          await supabase
            .from('full_stack_developers')
            .upsert({
              id: session.user.id,
              seniority_level: 'mid'
            }, { onConflict: 'id' })
          break
        case 'lead_full_stack_developer':
          await supabase
            .from('lead_full_stack_developers')
            .upsert({
              id: session.user.id,
              team_size: 3
            }, { onConflict: 'id' })
          break
        case 'admin':
          await supabase
            .from('admins')
            .upsert({
              id: session.user.id,
              admin_level: 'moderator'
            }, { onConflict: 'id' })
          break
        case 'seo_developer':
          await supabase
            .from('seo_developers')
            .upsert({
              id: session.user.id,
              seo_specialization: ['On-page SEO']
            }, { onConflict: 'id' })
          break
      }
    } catch (roleError) {
      console.error('Error creating role-specific data:', roleError)
    }

    // Redirect to dashboard
    const redirectUrl = new URL(redirectTo, request.url)
    console.log('Redirecting to:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)

  } catch (error: any) {
    console.error('Auth callback error:', error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'server_error')
    errorUrl.searchParams.set('message', error.message || 'Unknown error')
    return NextResponse.redirect(errorUrl)
  }
}