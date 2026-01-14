// app/api/meetings/types/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: meetingTypes, error } = await supabase
      .from('meeting_types')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching meeting types:', error)
      return NextResponse.json({ 
        types: [
          { id: '1', name: 'Client Meeting', description: 'Meeting with clients' },
          { id: '2', name: 'Team Meeting', description: 'Internal team meeting' },
          { id: '3', name: 'Project Review', description: 'Project status review' },
          { id: '4', name: 'Planning Session', description: 'Project planning meeting' }
        ] 
      })
    }

    return NextResponse.json({ types: meetingTypes || [] })

  } catch (error: any) {
    console.error('Error in meeting types API:', error)
    return NextResponse.json({ 
      types: [
        { id: '1', name: 'Client Meeting', description: 'Meeting with clients' },
        { id: '2', name: 'Team Meeting', description: 'Internal team meeting' },
        { id: '3', name: 'Project Review', description: 'Project status review' }
      ] 
    })
  }
}