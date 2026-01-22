import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    let projects;

    if (userData.role === 'admin') {
      // Admins see all projects
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          projecttemplates (
            *,
            templates (*)
          )
        `)
        .order('createdat', { ascending: false });

      if (error) throw error;
      projects = data;
    } else if (userData.role === 'client') {
      // Clients see projects they created
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          projecttemplates (
            *,
            templates (*)
          )
        `)
        .eq('created_by', user.id)
        .order('createdat', { ascending: false });

      if (error) throw error;
      projects = data;
    } else {
      // FSD, Lead FSD, PM see projects they are assigned to or have permissions for

      // 1. Get projects where they have custom permissions
      const { data: permissionProjects } = await supabase
        .from('user_project_permissions')
        .select('projectid')
        .eq('userid', user.id)
        .eq('is_active', true);

      // 2. Get projects where they are assigned to a task
      const { data: assignedTasks } = await supabase
        .from('project_task_assignments')
        .select(`
          project_tasks!inner (
            phases!inner (
              projectid
            )
          )
        `)
        .eq('userid', user.id);

      const projectIds = new Set<number>();

      // Projects created by them
      const { data: createdProjects } = await supabase
        .from('projects')
        .select('projectid')
        .eq('created_by', user.id);

      createdProjects?.forEach(p => projectIds.add(p.projectid));
      permissionProjects?.forEach(p => projectIds.add(p.projectid));
      assignedTasks?.forEach((at: any) => {
        const pid = at.project_tasks?.phases?.projectid;
        if (pid) projectIds.add(pid);
      });

      if (projectIds.size > 0) {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            projecttemplates (
              *,
              templates (*)
            )
          `)
          .in('projectid', Array.from(projectIds))
          .order('createdat', { ascending: false });

        if (error) throw error;
        projects = data;
      } else {
        projects = [];
      }
    }

    return NextResponse.json({ projects: projects || [] }, { status: 200 });

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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'project_manager', 'lead_full_stack_developer', 'client'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { projectname, description, projecttype, useAllTemplates } = body;

    if (!projectname) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Insert project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        projectname,
        description: description || '',
        projecttype: projecttype || 'General',
        created_by: user.id
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // If useAllTemplates is true, link all existing templates to this project
    if (useAllTemplates) {
      const { data: allTemplates } = await supabase.from('templates').select('templateid');

      if (allTemplates && allTemplates.length > 0) {
        const projectTemplates = allTemplates.map(t => ({
          projectid: project.projectid,
          templateid: t.templateid,
          created_by: user.id
        }));

        const { error: ptError } = await supabase
          .from('projecttemplates')
          .insert(projectTemplates);

        if (ptError) console.error('Error linking templates:', ptError);
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