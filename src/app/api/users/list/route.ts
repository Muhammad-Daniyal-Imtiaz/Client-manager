// app/api/users/list/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all users except the current user
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .neq('id', user.id)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ users: [] })
    }

    return NextResponse.json({ users: users || [] })

  } catch (error: unknown) {
    console.error('Error in users list API:', error)
    return NextResponse.json({ users: [] })
  }
}