import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
            supabaseResponse.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/projects']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Role-specific routes
  const roleRoutes = {
    admin: ['/admin', '/users', '/settings'],
    project_manager: ['/projects', '/team'],
    client: ['/dashboard', '/projects'],
    // Add other roles as needed
  }

  if (isProtectedRoute) {
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Get user role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (user) {
      // Check if user has access to the route based on role
      const userRole = user.role
      const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || []
      
      // Check if current path is allowed for this role
      const isRouteAllowed = allowedRoutes.some(route => 
        request.nextUrl.pathname.startsWith(route)
      ) || request.nextUrl.pathname === '/dashboard'

      if (!isRouteAllowed) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  // Redirect authenticated users away from auth pages
  const authPages = ['/login', '/signup', '/role-selection']
  if (authPages.includes(request.nextUrl.pathname) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}