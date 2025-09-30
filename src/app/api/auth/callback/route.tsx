// src/app/api/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=no_code`
      )
    }

    const supabase = await createClient()

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=auth_failed`
      )
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

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}${redirectTo}`)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=server_error`
    )
  }
}