import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../sutils/supabaseConfig';


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string; taskid: string }> }
) {
  try {
    const { taskid } = await params;
    const body = await request.json();
    const { taskdescription, status, duedate } = body;

    // Update the task in project_tasks table
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')  // CHANGED: from 'tasks' to 'project_tasks'
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
    const { taskid } = await params;

    // First delete any project task assignments
    const { error: assignmentError } = await supabase
      .from('project_task_assignments')  // CHANGED: from 'taskassignments' to 'project_task_assignments'
      .delete()
      .eq('taskid', parseInt(taskid));

    if (assignmentError) {
      console.error('Error deleting task assignments:', assignmentError);
    }

    // Then delete the task from project_tasks
    const { error } = await supabase
      .from('project_tasks')  // CHANGED: from 'tasks' to 'project_tasks'
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
    const { taskid } = await params;

    const { data: task, error } = await supabase
      .from('project_tasks')  // CHANGED: from 'tasks' to 'project_tasks'
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