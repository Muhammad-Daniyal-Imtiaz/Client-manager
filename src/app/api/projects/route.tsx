import { NextResponse } from 'next/server';
import { supabase } from '../sutils/supabaseConfig';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('projects')
      .select(`
        *,
        projecttemplates (
          templates (*)
        )
      `)
      .order('createdat', { ascending: false });

    if (category) {
      query = query.eq('projecttype', category);
    }

    const { data: projects, error } = await query;

    if (error) throw error;

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectname, description, projecttype, createdbyuserid, useAllTemplates = true } = body;

    if (!projectname || !projecttype) {
      return NextResponse.json(
        { error: 'Project name and type are required' },
        { status: 400 }
      );
    }

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{ 
        projectname, 
        description, 
        projecttype, 
        createdbyuserid: createdbyuserid || 1 
      }])
      .select()
      .single();

    if (projectError) throw projectError;

    // Get all templates
    const { data: allTemplates, error: templatesError } = await supabase
      .from('templates')
      .select(`
        *,
        templatephases (
          *,
          templatetasks (*)
        )
      `);

    if (templatesError) throw templatesError;

    // Link templates to project
    if (useAllTemplates && allTemplates) {
      // Add all templates to projecttemplates
      const projectTemplates = allTemplates.map(template => ({
        projectid: project.projectid,
        templateid: template.templateid,
        isactive: true
      }));

      const { error: linkError } = await supabase
        .from('projecttemplates')
        .insert(projectTemplates);

      if (linkError) throw linkError;

      // Create phases and tasks for each template
      for (const template of allTemplates) {
        if (template.templatephases) {
          for (const phase of template.templatephases) {
            // Create phase
            const { data: newPhase, error: phaseError } = await supabase
              .from('phases')
              .insert([{
                projectid: project.projectid,
                templateid: template.templateid,
                phasename: phase.phasename,
                phaseorder: phase.phaseorder,
                status: 'Not Started'
              }])
              .select()
              .single();

            if (phaseError) throw phaseError;

            // Create tasks for this phase
            if (phase.templatetasks && phase.templatetasks.length > 0) {
              const tasks = phase.templatetasks.map((task: any) => ({
                phaseid: newPhase.phaseid,
                templateid: template.templateid,
                taskdescription: task.taskdescription,
                status: 'Not Started'
              }));

              const { error: tasksError } = await supabase
                .from('tasks')
                .insert(tasks);

              if (tasksError) throw tasksError;
            }
          }
        }
      }
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}