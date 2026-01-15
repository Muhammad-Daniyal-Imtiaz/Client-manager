import { NextResponse } from 'next/server';
import { supabase } from '../sutils/supabaseConfig';

// GET method to fetch all projects
export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        projecttemplates (
          projecttemplateid,
          templateid,
          templates:templates!projecttemplates_templateid_fkey (
            templatename,
            category
          )
        )
      `)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects: projects || [] }, { status: 200 });

  } catch (error) {
    console.error('Error:', error);
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

    if (!projectname) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // 1. Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          projectname,
          description: description || '',
          projecttype: projecttype || 'General',
          createdbyuserid: createdbyuserid || 1,
          createdat: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return NextResponse.json(
        { error: 'Failed to create project', details: projectError.message },
        { status: 500 }
      );
    }

    // 2. Get all templates
    const { data: allTemplates, error: templatesError } = await supabase
      .from('templates')
      .select('templateid, templatename, category');

    if (templatesError) {
      console.error('Templates fetch error:', templatesError);
      // Continue with project creation even if templates fail
      return NextResponse.json(
        { 
          project, 
          message: 'Project created but templates may not be added' 
        },
        { status: 201 }
      );
    }

    // Filter to only include the 5 marketing templates if useAllTemplates is true
    const templatesToAdd = useAllTemplates 
      ? allTemplates?.filter(t => 
          ['SEO', 'Email Marketing', 'Social Media', 'Automation', 'Graphic Design']
          .includes(t.category)
        ) || []
      : allTemplates || [];

    // 3. Add templates to project
    for (const template of templatesToAdd) {
      try {
        // Add project template
        const { error: projectTemplateError } = await supabase
          .from('projecttemplates')
          .insert({
            projectid: project.projectid,
            templateid: template.templateid,
            isactive: true
          });

        if (projectTemplateError) {
          console.error(`Error adding template ${template.category}:`, projectTemplateError);
          continue; // Continue with other templates
        }

        // 4. Get template phases
        const { data: templatePhases, error: phasesError } = await supabase
          .from('templatephases')
          .select('*')
          .eq('templateid', template.templateid)
          .order('phaseorder', { ascending: true });

        if (phasesError) {
          console.error(`Error fetching phases for template ${template.category}:`, phasesError);
          continue;
        }

        if (!templatePhases || templatePhases.length === 0) {
          console.log(`No phases found for template ${template.category}`);
          continue;
        }

        // 5. Create project phases for each template phase
        for (const templatePhase of templatePhases) {
          try {
            // Create project phase
            const { data: projectPhase, error: phaseCreateError } = await supabase
              .from('phases')
              .insert({
                projectid: project.projectid,
                templateid: template.templateid,
                phasename: templatePhase.phasename,
                phaseorder: templatePhase.phaseorder,
                status: 'Not Started'
              })
              .select()
              .single();

            if (phaseCreateError) {
              console.error(`Error creating phase ${templatePhase.phasename}:`, phaseCreateError);
              continue;
            }

            // 6. Get template tasks for this phase
            const { data: templateTasks, error: tasksError } = await supabase
              .from('templatetasks')
              .select('*')
              .eq('templatephaseid', templatePhase.templatephaseid)
              .order('templatetaskid', { ascending: true });

            if (tasksError) {
              console.error(`Error fetching tasks for phase ${templatePhase.phasename}:`, tasksError);
              continue;
            }

            if (!templateTasks || templateTasks.length === 0) {
              console.log(`No tasks found for phase ${templatePhase.phasename}`);
              continue;
            }

            // 7. Create project tasks for each template task
            const taskPromises = templateTasks.map(templateTask =>
              supabase
                .from('project_tasks')
                .insert({
                  phaseid: projectPhase.phaseid,
                  taskdescription: templateTask.taskdescription,
                  status: 'Not Started'
                })
            );

            await Promise.all(taskPromises);

          } catch (phaseError) {
            console.error(`Error processing phase ${templatePhase.phasename}:`, phaseError);
            continue;
          }
        }

      } catch (templateError) {
        console.error(`Error processing template ${template.category}:`, templateError);
        continue; // Continue with other templates
      }
    }

    return NextResponse.json(
      { 
        project, 
        message: 'Project created successfully with all templates, phases, and tasks' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    );
  }
}