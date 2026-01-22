import { NextResponse } from 'next/server';
import { supabase } from './../../../../../sutils/supabaseConfig';

import { createClient } from '@/utils/supabase/server';
import { hasPermission } from '@/utils/permissionHelpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string }> }
) {
  try {
    const { phaseid, projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user can create tasks
    const canCreate = await hasPermission(supabase, user.id, projectId, 'create_task');
    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions to create task' }, { status: 403 });
    }
    
    const body = await request.json();
    const { taskdescription, duedate } = body;

    if (!taskdescription) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      );
    }

    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .insert([
        { 
          phaseid: parseInt(phaseid), 
          taskdescription, 
          duedate,
          status: 'Not Started',
          created_by: user.id
        }
      ])
      .select()
      .single();

    if (taskError) throw taskError;

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}