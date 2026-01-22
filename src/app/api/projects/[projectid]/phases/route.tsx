import { NextResponse } from 'next/server';
import { supabase } from './../../../sutils/supabaseConfig';

import { createClient } from '@/utils/supabase/server';
import { hasPermission, checkPhasePermission } from '@/utils/permissionHelpers';

// GET all phases for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    const { projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has view permission for phases
    const canView = await hasPermission(supabase, user.id, projectId, 'view_phase');
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: phases, error: phasesError } = await supabase
      .from('phases')
      .select(`
        *,
        templates (
          templatename,
          category
        ),
        project_tasks (
          *,
          project_task_assignments (
            *,
            users (*)
          )
        )
      `)
      .eq('projectid', projectId)
      .order('phaseorder', { ascending: true });

    if (phasesError) {
      console.error('Phases fetch error:', phasesError);
      return NextResponse.json(
        { error: 'Failed to fetch phases', details: phasesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ phases: phases || [] }, { status: 200 });

  } catch (error) {
    console.error('Error fetching phases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phases' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    const { projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can create phases
    const canCreate = await hasPermission(supabase, user.id, projectId, 'create_phase');
    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions to create phase' }, { status: 403 });
    }

    const body = await request.json();
    const { phasename, phaseorder, templateid } = body;

    if (!phasename) {
      return NextResponse.json(
        { error: 'Phase name is required' },
        { status: 400 }
      );
    }

    // Get the max phase order if not provided
    let order = phaseorder;
    if (!order) {
      const { data: phases, error: phasesError } = await supabase
        .from('phases')
        .select('phaseorder')
        .eq('projectid', parseInt(projectid))
        .order('phaseorder', { ascending: false })
        .limit(1);

      if (phasesError) throw phasesError;
      order = phases && phases.length > 0 ? phases[0].phaseorder + 1 : 1;
    }

    const { data: phase, error: phaseError } = await supabase
      .from('phases')
      .insert([
        {
          projectid: parseInt(projectid),
          phasename,
          phaseorder: order,
          status: 'Not Started',
          templateid: templateid || null,
          created_by: user.id
        }
      ])
      .select(`
        *,
        templates (
          templatename,
          category
        )
      `)
      .single();

    if (phaseError) throw phaseError;

    return NextResponse.json(phase, { status: 201 });
  } catch (error) {
    console.error('Error creating phase:', error);
    return NextResponse.json(
      { error: 'Failed to create phase' },
      { status: 500 }
    );
  }
}