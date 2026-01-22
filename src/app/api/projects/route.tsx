import { NextResponse } from 'next/server';
import { supabase } from './../sutils/supabaseConfig';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    const { projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentUser || !['admin', 'project_manager', 'lead_full_stack_developer'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      targetUserId,
      can_create_phase,
      can_edit_phase,
      can_delete_phase,
      can_create_task,
      can_edit_task,
      can_delete_task,
      can_assign_task,
      can_delete_project,
      expires_at
    } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    const { data: permission, error } = await supabase
      .from('user_project_permissions')
      .upsert({
        userid: targetUserId,
        projectid: projectId,
        can_create_phase: can_create_phase || false,
        can_edit_phase: can_edit_phase || false,
        can_delete_phase: can_delete_phase || false,
        can_create_task: can_create_task || false,
        can_edit_task: can_edit_task || false,
        can_delete_task: can_delete_task || false,
        can_assign_task: can_assign_task || false,
        can_delete_project: can_delete_project || false,
        granted_by: user.id,
        expires_at: expires_at || null,
        is_active: true
      }, {
        onConflict: 'userid,projectid'
      })
      .select(`
        *,
        users!user_project_permissions_userid_fkey (id, name, email, role, avatar_url),
        granted_by_user:users!user_project_permissions_granted_by_fkey (id, name, email, avatar_url)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ permission }, { status: 200 });
  } catch (error) {
    console.error('Error granting permission:', error);
    return NextResponse.json(
      { error: 'Failed to grant permission' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    const { projectid } = await params;
    const projectId = parseInt(projectid);
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentUser || !['admin', 'project_manager', 'lead_full_stack_developer'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: permissions, error } = await supabase
      .from('user_project_permissions')
      .select(`
        *,
        users!user_project_permissions_userid_fkey (id, name, email, role, avatar_url),
        granted_by_user:users!user_project_permissions_granted_by_fkey (id, name, email, avatar_url)
      `)
      .eq('projectid', projectId)
      .eq('is_active', true);

    if (error) throw error;

    return NextResponse.json({ permissions: permissions || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
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
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentUser || !['admin', 'project_manager', 'lead_full_stack_developer'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('userid');

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_project_permissions')
      .update({ is_active: false })
      .eq('userid', targetUserId)
      .eq('projectid', projectId);

    if (error) throw error;

    return NextResponse.json({ message: 'Permission revoked successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error revoking permission:', error);
    return NextResponse.json(
      { error: 'Failed to revoke permission' },
      { status: 500 }
    );
  }
}