import { NextResponse } from 'next/server';
import { supabase } from '../sutils/supabaseConfig';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get tasks assigned to user (using lowercase table names)
    const { data: tasks, error: tasksError } = await supabase
      .from('taskassignments')  // Lowercase table name
      .select(`
        *,
        tasks (
          *,
          phases (
            *,
            projects (*)
          )
        ),
        users (*)
      `)
      .eq('userid', userId);  // Lowercase column name

    if (tasksError) {
      console.error('Supabase tasks error:', tasksError);
      throw tasksError;
    }

    // Get projects where user is a team member (using lowercase table names)
    const { data: projects, error: projectsError } = await supabase
      .from('projectteam')  // Lowercase table name
      .select(`
        *,
        projects (
          *,
          phases (
            *,
            tasks (
              *,
              taskassignments (
                *,
                users (*)
              )
            )
          )
        )
      `)
      .eq('userid', userId);  // Lowercase column name

    if (projectsError) {
      console.error('Supabase projects error:', projectsError);
      throw projectsError;
    }

    return NextResponse.json({ 
      assignedTasks: tasks || [],
      userProjects: projects || []
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { taskId, isCompleted } = body;

    if (!taskId || typeof isCompleted === 'undefined') {
      return NextResponse.json(
        { error: 'Task ID and completion status are required' },
        { status: 400 }
      );
    }

    // Use lowercase table name
    const { data, error } = await supabase
      .from('tasks')  // Lowercase table name
      .update({ iscompleted: isCompleted })  // Lowercase column name
      .eq('taskid', taskId)  // Lowercase column name
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    );
  }
}