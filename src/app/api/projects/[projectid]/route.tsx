import { NextResponse } from 'next/server';
import { supabase } from './../../sutils/supabaseConfig';

export async function GET(
  request: Request,
  { params }: { params: { projectid: string } }
) {
  try {
    const projectId = parseInt(params.projectid);

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('projectid', projectId)
      .single();

    if (projectError) throw projectError;

    // Get phases with tasks and assignments
    const { data: phases, error: phasesError } = await supabase
      .from('phases')
      .select(`
        *,
        tasks (
          *,
          taskassignments (
            *,
            users (*)
          )
        )
      `)
      .eq('projectid', projectId)
      .order('phaseorder', { ascending: true });

    if (phasesError) throw phasesError;

    // Get project templates
    const { data: projectTemplates, error: templatesError } = await supabase
      .from('projecttemplates')
      .select(`
        *,
        templates (*)
      `)
      .eq('projectid', projectId);

    if (templatesError) throw templatesError;

    return NextResponse.json({ 
      project: {
        ...project,
        phases: phases || [],
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