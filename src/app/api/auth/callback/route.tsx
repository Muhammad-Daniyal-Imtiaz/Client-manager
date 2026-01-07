// src/app/api/auth/callback/route.ts
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

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

    console.log('User authenticated:', session.user.email)

    // Check if this is a new user and if we have a signup role
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id, role')
      .eq('id', session.user.id)
      .single()

    // Get role from user metadata if available, or use the signup role
    let signupRole = session.user.user_metadata?.role || 'client'
    
    // Use the service role to call the database function
    const { data: dbResult, error: funcError } = await adminClient
      .rpc('create_or_update_user_oauth', {
        user_id: session.user.id,
        user_email: session.user.email!,
        user_name: session.user.user_metadata?.name || 
                   session.user.user_metadata?.full_name || 
                   session.user.email?.split('@')[0] || 
                   'User',
        user_role: existingUser ? null : signupRole, // Only set role for new users
        user_avatar_url: session.user.user_metadata?.avatar_url || null
      })

    if (funcError) {
      console.error('Database function error:', funcError)
      // Don't fail the auth flow, just log the error
    }

    if (dbResult) {
      console.log('User creation/update result:', dbResult)
    }

    // Get the user's role for redirect
    const { data: userData } = await adminClient
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = userData?.role || 'client'

    // Redirect to dashboard with role info
    const dashUrl = new URL(redirectTo, request.url)
    dashUrl.searchParams.set('role', userRole)

    // Return response with Set-Cookie to finalize session
    const response = NextResponse.redirect(dashUrl)
    return response
  } catch (error) {
    console.error('Callback error:', error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'server_error')
    return NextResponse.redirect(errorUrl)
  }
}