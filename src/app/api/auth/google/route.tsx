// src/app/api/auth/google/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const redirectTo = searchParams.get('redirectTo') || '/dashboard'
    const role = searchParams.get('role') || 'client'
    
    // Use dynamic base URL from the request
    const baseUrl = new URL(request.url).origin
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/api/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}&role=${encodeURIComponent(role)}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google OAuth error:', error)
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }

    if (!data?.url) {
      console.error('No URL returned from OAuth')
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'no_oauth_url')
      return NextResponse.redirect(errorUrl)
    }

    console.log('Redirecting to Google OAuth:', data.url)
    return NextResponse.redirect(data.url)
  } catch (error) {
    console.error('Google OAuth route error:', error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'server_error')
    return NextResponse.redirect(errorUrl)
  }
}