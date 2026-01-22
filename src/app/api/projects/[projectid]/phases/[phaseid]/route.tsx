import { NextResponse } from 'next/server';
import { supabase } from '../../../../sutils/supabaseConfig';


import { createClient } from '@/utils/supabase/server';
import { hasPermission, checkCustomPermission, canDeleteProject, getUserWithRole } from '@/utils/permissionHelpers';

// Add GET method to fetch a specific phase
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string }> }
) {
  try {
    const { phaseid } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get phase to get project ID
    const { data: phaseData, error: phaseFetchError } = await supabase
      .from('phases')
      .select('projectid')
      .eq('phaseid', parseInt(phaseid))
      .single();

    if (phaseFetchError || !phaseData) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    // Check if user has view permission for phases
    const canView = await hasPermission(supabase, user.id, phaseData.projectid, 'view_phase');
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: phase, error: phaseError } = await supabase
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
      .eq('phaseid', parseInt(phaseid))
      .single();

    if (phaseError) {
      console.error('Phase fetch error:', phaseError);
      return NextResponse.json(
        { error: 'Failed to fetch phase', details: phaseError.message },
        { status: 500 }
      );
    }

    if (!phase) {
      return NextResponse.json(
        { message: 'Phase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ phase }, { status: 200 });

  } catch (error) {
    console.error('Error fetching phase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phase' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string }> }
) {
  try {
    const { phaseid, projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await getUserWithRole(supabase, user.id);

    // Check if user can edit phases
    const canEdit = await hasPermission(supabase, user.id, projectId, 'edit_phase');
    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions to edit phase' }, { status: 403 });
    }

    const body = await request.json();
    const { phasename, status, templateid } = body;

    // Additional restriction for Full Stack Developers
    if (userData?.role === 'full_stack_developer') {
      // Check if they are trying to change the name
      const { data: currentPhase } = await supabase
        .from('phases')
        .select('phasename')
        .eq('phaseid', parseInt(phaseid))
        .single();

      if (currentPhase && phasename && currentPhase.phasename !== phasename) {
        // Only allow name change if they have explicit custom permission
        const hasCustomEditPermission = await checkCustomPermission(supabase, user.id, projectId, 'edit_phase');
        if (!hasCustomEditPermission) {
          return NextResponse.json({ error: 'Full Stack Developers cannot change phase names' }, { status: 403 });
        }
      }
    }

    if (!phasename && !status && templateid === undefined) {
      return NextResponse.json(
        { error: 'Nothing to update' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (phasename) updateData.phasename = phasename;
    if (status) updateData.status = status;
    if (templateid !== undefined) updateData.templateid = templateid;

    const { data: phase, error: phaseError } = await supabase
      .from('phases')
      .update(updateData)
      .eq('phaseid', parseInt(phaseid))
      .select(`
        *,
        templates (
          templatename,
          category
        )
      `)
      .single();

    if (phaseError) throw phaseError;

    return NextResponse.json(phase, { status: 200 });
  } catch (error) {
    console.error('Error updating phase:', error);
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string }> }
) {
  try {
    const { phaseid, projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the phase to check who created it
    const { data: phase, error: phaseFetchError } = await supabase
      .from('phases')
      .select('created_by, templates (category)')
      .eq('phaseid', parseInt(phaseid))
      .single();

    if (phaseFetchError) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    const userData = await getUserWithRole(supabase, user.id);

    // Check permissions based on role and phase creator
    if (userData?.role === 'lead_full_stack_developer' && phase?.created_by) {
      // Lead developer cannot delete phases created by admin or project manager
      const { data: creatorRole } = await supabase
        .from('users')
        .select('role')
        .eq('id', phase.created_by)
        .single();

      if (creatorRole?.role === 'admin' || creatorRole?.role === 'project_manager') {
        return NextResponse.json({
          error: 'Cannot delete phases created by admin or project manager'
        }, { status: 403 });
      }
    }

    // Check if user can delete phases
    const canDelete = await hasPermission(supabase, user.id, projectId, 'delete_phase');
    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions to delete phase' }, { status: 403 });
    }

    const { error } = await supabase
      .from('phases')
      .delete()
      .eq('phaseid', parseInt(phaseid));

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Phase deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}