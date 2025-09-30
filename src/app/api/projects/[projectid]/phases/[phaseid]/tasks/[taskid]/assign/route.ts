import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../../sutils/supabaseConfig';


export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string; taskid: string }> }
) {
  try {
    const { taskid } = await params;
    const body = await request.json();
    const { userid } = body;

    if (!userid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('taskassignments')
      .insert([
        { 
          taskid: parseInt(taskid), 
          userid 
        }
      ])
      .select(`
        *,
        users (*)
      `)
      .single();

    if (assignmentError) throw assignmentError;

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error assigning task:', error);
    return NextResponse.json(
      { error: 'Failed to assign task' },
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
    const body = await request.json();
    const { userid } = body;

    if (!userid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('taskassignments')
      .delete()
      .eq('taskid', taskid)
      .eq('userid', userid);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Task assignment removed successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}