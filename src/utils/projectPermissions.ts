import { SupabaseClient } from '@supabase/supabase-js'

export async function checkProjectAssignment(
    supabase: SupabaseClient,
    userId: string,
    projectId: number
): Promise<boolean> {
    // Check multiple ways a user can be assigned to a project

    // 1. Check if user is project creator
    const { data: project } = await supabase
        .from('projects')
        .select('createdbyuserid')
        .eq('projectid', projectId)
        .single()

    if (project?.createdbyuserid === userId) return true

    // 2. Check if user is a project manager for this project
    const { data: isProjectManager } = await supabase
        .from('project_managers')
        .select('id')
        .eq('id', userId)
        .single()

    if (isProjectManager) {
        // Check if this project manager is assigned to this project
        const { data: projectAssignment } = await supabase
            .from('project_assignments')
            .select('projectid')
            .eq('userid', userId)
            .eq('projectid', projectId)
            .single()

        if (projectAssignment) return true
    }

    // 3. Check if user is assigned to any task in this project
    const { data: taskAssignment } = await supabase
        .from('project_task_assignments')
        .select(`
      userid,
      project_tasks!inner(
        phases!inner(
          projectid
        )
      )
    `)
        .eq('userid', userId)
        .eq('project_tasks.phases.projectid', projectId)
        .limit(1)

    return !!(taskAssignment && taskAssignment.length > 0)
}

export async function checkTaskCreatorPermission(
    supabase: SupabaseClient,
    userId: string,
    taskId: number
): Promise<{ canDelete: boolean; canEdit: boolean; creatorId?: string }> {
    const { data: task } = await supabase
        .from('project_tasks')
        .select('created_by')
        .eq('taskid', taskId)
        .single()

    if (!task) {
        return { canDelete: false, canEdit: false }
    }

    const creatorId = task.created_by

    // Get user role
    const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

    if (!user) {
        return { canDelete: false, canEdit: false, creatorId }
    }

    // Get creator role
    const { data: creator } = await supabase
        .from('users')
        .select('role')
        .eq('id', creatorId)
        .single()

    const creatorRole = creator?.role || ''

    // Permission logic
    switch (user.role) {
        case 'admin':
            return { canDelete: true, canEdit: true, creatorId }

        case 'project_manager':
            return { canDelete: true, canEdit: true, creatorId }

        case 'lead_full_stack_developer':
            // Cannot delete tasks created by admin or project manager
            if (creatorRole === 'admin' || creatorRole === 'project_manager') {
                return { canDelete: false, canEdit: true, creatorId }
            }
            return { canDelete: true, canEdit: true, creatorId }

        case 'full_stack_developer':
            // Can edit but not delete tasks
            return { canDelete: false, canEdit: true, creatorId }

        default:
            return { canDelete: false, canEdit: false, creatorId }
    }
}

export async function checkPhaseCreatorPermission(
    supabase: SupabaseClient,
    userId: string,
    phaseId: number
): Promise<{ canDelete: boolean; canEdit: boolean; creatorId?: string }> {
    const { data: phase } = await supabase
        .from('phases')
        .select('created_by')
        .eq('phaseid', phaseId)
        .single()

    if (!phase) {
        return { canDelete: false, canEdit: false }
    }

    const creatorId = phase.created_by

    // Get user role
    const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

    if (!user) {
        return { canDelete: false, canEdit: false, creatorId }
    }

    // Get creator role
    const { data: creator } = await supabase
        .from('users')
        .select('role')
        .eq('id', creatorId)
        .single()

    const creatorRole = creator?.role || ''

    // Permission logic
    switch (user.role) {
        case 'admin':
            return { canDelete: true, canEdit: true, creatorId }

        case 'project_manager':
            return { canDelete: true, canEdit: true, creatorId }

        case 'lead_full_stack_developer':
            // Cannot delete phases created by admin or project manager
            if (creatorRole === 'admin' || creatorRole === 'project_manager') {
                return { canDelete: false, canEdit: true, creatorId }
            }
            return { canDelete: true, canEdit: true, creatorId }

        case 'full_stack_developer':
            // Cannot delete phases at all
            return { canDelete: false, canEdit: true, creatorId }

        default:
            return { canDelete: false, canEdit: false, creatorId }
    }
}