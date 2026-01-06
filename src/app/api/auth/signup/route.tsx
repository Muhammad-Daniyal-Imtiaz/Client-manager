import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Role passwords from environment variables
const ROLE_PASSWORDS = {
  client: process.env.CLIENT_PASSWORD!,
  project_manager: process.env.PROJECT_MANAGER_PASSWORD!,
  full_stack_developer: process.env.FULL_STACK_DEVELOPER_PASSWORD!,
  lead_full_stack_developer: process.env.LEAD_FULL_STACK_DEVELOPER_PASSWORD!,
  admin: process.env.ADMIN_PASSWORD!,
  seo_developer: process.env.SEO_DEVELOPER_PASSWORD!
}

export async function POST(request: Request) {
  try {
    const { email, password, name, role, rolePassword, ...additionalData } = await request.json()

    // Validate required fields
    if (!email || !password || !name || !role || !rolePassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['client', 'project_manager', 'full_stack_developer', 'lead_full_stack_developer', 'admin', 'seo_developer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      )
    }

    // Verify role-specific password
    const expectedPassword = ROLE_PASSWORDS[role as keyof typeof ROLE_PASSWORDS]
    if (!expectedPassword || rolePassword !== expectedPassword) {
      return NextResponse.json(
        { error: 'Invalid role password. Please contact support.' },
        { status: 401 }
      )
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          ...additionalData
        },
        emailRedirectTo: `${request.headers.get('origin')}/dashboard`
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      )
    }

    // Create user record in users table
    const { error: userError } = await adminClient
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          role,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])

    if (userError) {
      console.error('User creation error:', userError)
      // Try to delete auth user if user creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Create role-specific data based on role
    switch (role) {
      case 'client':
        await adminClient
          .from('clients')
          .insert([
            {
              id: authData.user.id,
              company_name: additionalData.company_name || 'New Client',
              company_size: additionalData.company_size || '1-10',
              industry: additionalData.industry || 'Technology',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
        break
      
      case 'project_manager':
        await adminClient
          .from('project_managers')
          .insert([
            {
              id: authData.user.id,
              department: additionalData.department || 'Project Management',
              manager_level: additionalData.manager_level || 'mid',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
        break
      
      case 'full_stack_developer':
        await adminClient
          .from('full_stack_developers')
          .insert([
            {
              id: authData.user.id,
              seniority_level: additionalData.seniority_level || 'mid',
              tech_stack: additionalData.tech_stack || ['JavaScript', 'Python'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
        break
      
      // Add other role cases here...
      
      default:
        break
    }

    return NextResponse.json({
      success: true,
      message: authData.session 
        ? 'Signup successful! Redirecting...' 
        : 'Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role,
        is_verified: authData.user.email_confirmed_at !== null
      }
    })

  } catch (error: unknown) {
    console.error('Signup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Signup failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}