import { NextResponse } from 'next/server';
import { supabase } from './../../sutils/supabaseConfig';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    // Await params first
    const { projectid } = await params;
    const projectId = parseInt(projectid);

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('projectid', projectId)
      .single();

    if (projectError) {
      console.error('Project fetch error:', projectError);
      return NextResponse.json(
        { error: 'Failed to fetch project', details: projectError.message },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch phases for this project WITH template information
    const { data: phases, error: phasesError } = await supabase
      .from('phases')
      .select(`
        *,
        templates (
          templatename,
          category
        )
      `)
      .eq('projectid', projectId)
      .order('phaseorder', { ascending: true });

    if (phasesError) {
      console.error('Phases fetch error:', phasesError);
    }

    // Fetch project_tasks for each phase
    const phasesWithTasks = [];
    if (phases && phases.length > 0) {
      for (const phase of phases) {
        const { data: tasks, error: tasksError } = await supabase
          .from('project_tasks')
          .select(`
            *,
            project_task_assignments (
              *,
              users (*)
            )
          `)
          .eq('phaseid', phase.phaseid)
          .order('createdat', { ascending: true });

        if (tasksError) {
          console.error('Tasks fetch error for phase', phase.phaseid, tasksError);
        }

        phasesWithTasks.push({
          ...phase,
          tasks: tasks || []
        });
      }
    }

    // Get project templates
    const { data: projectTemplates, error: templatesError } = await supabase
      .from('projecttemplates')
      .select(`
        *,
        templates (*)
      `)
      .eq('projectid', projectId);

    if (templatesError) {
      console.error('Templates fetch error:', templatesError);
    }

    return NextResponse.json({
      project: {
        ...project,
        phases: phasesWithTasks,
        projecttemplates: projectTemplates || []
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// Add other methods if needed (PUT, DELETE)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    const { projectid } = await params;
    const projectId = parseInt(projectid);
    const body = await request.json();
    const { projectname, description, projecttype } = body;

    if (!projectname) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .update({
        projectname,
        description: description || null,
        projecttype: projecttype || 'General'
      })
      .eq('projectid', projectId)
      .select()
      .single();

    if (projectError) {
      console.error('Project update error:', projectError);
      return NextResponse.json(
        { error: 'Failed to update project', details: projectError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 200 });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    const { projectid } = await params;
    const projectId = parseInt(projectid);

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('projectid', projectId);

    if (error) {
      console.error('Project delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete project', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}