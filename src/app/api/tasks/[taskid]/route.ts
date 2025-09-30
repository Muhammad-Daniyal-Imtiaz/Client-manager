import { NextResponse } from 'next/server';
import { supabase } from './../../sutils/supabaseConfig';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ taskid: string }> }
) {
  try {
    const { taskid } = await params;
    const body = await request.json();
    const { taskdescription, status, assignedto, completedby } = body;

    if (!taskdescription) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      );
    }

    const updateData: any = { taskdescription };
    
    if (status) {
      updateData.status = status;
      
      if (status === 'Completed' && completedby) {
        updateData.completedby = completedby;
        updateData.completedat = new Date().toISOString();
      } else if (status !== 'Completed') {
        updateData.completedby = null;
        updateData.completedat = null;
      }
    }
    
    if (assignedto) {
      updateData.assignedto = assignedto;
    }

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('taskid', taskid)
      .select()
      .single();

    if (taskError) throw taskError;

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
  { params }: { params: Promise<{ taskid: string }> }
) {
  try {
    const { taskid } = await params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('taskid', taskid);

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