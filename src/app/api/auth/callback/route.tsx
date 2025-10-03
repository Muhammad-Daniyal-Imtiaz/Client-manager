// src/app/api/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

    if (!code) {
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'no_code')
      return NextResponse.redirect(errorUrl)
    }

    const supabase = await createClient()

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      const errorUrl = new URL('/login', request.url)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }

    if (session?.user) {
      // Ensure client record exists for OAuth users
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!existingClient) {
        await supabase
          .from('clients')
          .insert([
            {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              company: session.user.user_metadata?.company || 'Unknown',
              phone: session.user.user_metadata?.phone || null,
              role: 'client',
            },
          ])
      }
    }

    // Use dynamic URL based on current request
    const baseUrl = new URL(request.url).origin
    return NextResponse.redirect(`${baseUrl}${redirectTo}`)
  } catch (error) {
    console.error('Auth callback error:', error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'server_error')
    return NextResponse.redirect(errorUrl)
  }
}