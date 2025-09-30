import { NextResponse } from 'next/server';
import { supabase } from './../../../sutils/supabaseConfig';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string }> }
) {
  try {
    const { phaseid } = await params;
    const body = await request.json();
    const { taskdescription, duedate } = body;

    if (!taskdescription) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      );
    }

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([
        { 
          phaseid: parseInt(phaseid), 
          taskdescription, 
          duedate,
          status: 'Not Started'
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