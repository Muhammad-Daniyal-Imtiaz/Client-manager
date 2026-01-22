import { NextResponse } from 'next/server';
// import { supabase } from '../../../../../../sutils/supabaseConfig';


import { createClient } from '@/utils/supabase/server';
import { hasPermission, getUserWithRole } from '@/utils/permissionHelpers';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string; taskid: string }> }
) {
  try {
    const { taskid, projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user can edit tasks
    const canEdit = await hasPermission(supabase, user.id, projectId, 'edit_task');
    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions to edit task' }, { status: 403 });
    }
    
    const body = await request.json();
    const { taskdescription, status, duedate } = body;

    // Update the task in project_tasks table
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .update({ 
        taskdescription, 
        status, 
        duedate: duedate ? new Date(duedate).toISOString() : null 
      })
      .eq('taskid', parseInt(taskid))
      .select()
      .single();

    if (taskError) {
      console.error('Supabase error:', taskError);
      return NextResponse.json({ error: taskError.message }, { status: 500 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string; taskid: string }> }
) {
  try {
    const { taskid, projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the task to check who created it
    const { data: task, error: taskFetchError } = await supabase
      .from('project_tasks')
      .select('created_by')
      .eq('taskid', parseInt(taskid))
      .single();

    if (taskFetchError) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const userData = await getUserWithRole(supabase, user.id);
    
    // Check permissions based on role and task creator
    if (userData?.role === 'full_stack_developer') {
      // Full stack developers cannot delete tasks
      return NextResponse.json({ 
        error: 'Full stack developers cannot delete tasks' 
      }, { status: 403 });
    }

    if (userData?.role === 'lead_full_stack_developer' && task?.created_by) {
      // Lead developer cannot delete tasks created by admin or project manager
      const { data: creatorRole } = await supabase
        .from('users')
        .select('role')
        .eq('id', task.created_by)
        .single();
      
      if (creatorRole?.role === 'admin' || creatorRole?.role === 'project_manager') {
        return NextResponse.json({ 
          error: 'Cannot delete tasks created by admin or project manager' 
        }, { status: 403 });
      }
    }
    
    // Check if user can delete tasks
    const canDelete = await hasPermission(supabase, user.id, projectId, 'delete_task');
    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions to delete task' }, { status: 403 });
    }

    // First delete any project task assignments
    const { error: assignmentError } = await supabase
      .from('project_task_assignments')
      .delete()
      .eq('taskid', parseInt(taskid));

    if (assignmentError) {
      console.error('Error deleting task assignments:', assignmentError);
    }

    // Then delete the task from project_tasks
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('taskid', parseInt(taskid));

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string; taskid: string }> }
) {
  try {
    const { taskid, projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has view permission for tasks
    const canView = await hasPermission(supabase, user.id, projectId, 'view_task');
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: task, error } = await supabase
      .from('project_tasks')
      .select(`
        *,
        project_task_assignments (
          *,
          users (*)
        )
      `)
      .eq('taskid', parseInt(taskid))
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}