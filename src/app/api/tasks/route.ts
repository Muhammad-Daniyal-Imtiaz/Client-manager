import { NextResponse } from 'next/server';
import { supabase } from '../sutils/supabaseConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phaseid, taskdescription, duedate, assignees, createdbyuserid } = body;

    if (!phaseid || !taskdescription) {
      return NextResponse.json(
        { error: 'Phase ID and task description are required' },
        { status: 400 }
      );
    }

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([
        { 
          phaseid, 
          taskdescription, 
          duedate, 
          createdbyuserid,
          iscompleted: false
        }
      ])
      .select()
      .single();

    if (taskError) throw taskError;

    if (assignees && assignees.length > 0) {
      const assignments = assignees.map((userid: number) => ({
        taskid: task.taskid,
        userid
      }));

      const { error: assignmentError } = await supabase
        .from('taskassignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}