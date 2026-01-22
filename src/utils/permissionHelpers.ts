import { SupabaseClient } from '@supabase/supabase-js'

export interface UserWithRole {
    id: string
    email: string
    name: string
    role: 'client' | 'project_manager' | 'full_stack_developer' | 'lead_full_stack_developer' | 'admin' | 'seo_developer'
    [key: string]: any
}

export async function getUserWithRole(supabase: SupabaseClient, userId: string): Promise<UserWithRole | null> {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error || !user) return null
    return user as UserWithRole
}

export async function getProjectCreator(supabase: SupabaseClient, projectId: number): Promise<string | null> {
    const { data: project, error } = await supabase
        .from('projects')
        .select('createdbyuserid')
        .eq('projectid', projectId)
        .single()

    if (error || !project) return null
    return project.createdbyuserid
}

export async function getTeamHierarchy(supabase: SupabaseClient, userId: string): Promise<string[]> {
    const user = await getUserWithRole(supabase, userId)
    if (!user) return []

    const teamMembers: string[] = [userId]

    switch (user.role) {
        case 'admin':
            const { data: allUsers } = await supabase
                .from('users')
                .select('id')
                .neq('role', 'admin')
                .eq('is_active', true)

            if (allUsers) {
                teamMembers.push(...allUsers.map(u => u.id))
            }
            break

        case 'project_manager':
            const { data: managedProjects } = await supabase
                .from('project_managers')
                .select(`
          project_assignments (
            projectid,
            projects (
              project_task_assignments (
                userid
              )
            )
          )
        `)
                .eq('id', userId)
                .single()

            if (managedProjects?.project_assignments) {
                const assignments = managedProjects.project_assignments as any[]
                for (const assignment of assignments) {
                    if (assignment?.projects?.project_task_assignments) {
                        const taskAssignments = assignment.projects.project_task_assignments as any[]
                        for (const taskAssignment of taskAssignments) {
                            if (taskAssignment.userid) {
                                teamMembers.push(taskAssignment.userid)
                            }
                        }
                    }
                }
            }
            break

        case 'lead_full_stack_developer':
            const { data: leadDev } = await supabase
                .from('lead_full_stack_developers')
                .select('team_members')
                .eq('id', userId)
                .single()

            if (leadDev?.team_members) {
                const members = leadDev.team_members as string[]
                teamMembers.push(...members)
            }
            break
    }

    return [...new Set(teamMembers)]
}

export async function canDeleteProject(
    supabase: SupabaseClient,
    userId: string,
    projectId: number
): Promise<boolean> {
    const user = await getUserWithRole(supabase, userId)
    if (!user) return false

    // Check custom permissions first
    const { data: customPermission } = await supabase
        .from('user_project_permissions')
        .select('can_delete_project')
        .eq('userid', userId)
        .eq('projectid', projectId)
        .eq('is_active', true)
        .single()

    if (customPermission?.can_delete_project) return true

    // Role-based permissions
    if (user.role === 'admin') return true

    const projectCreator = await getProjectCreator(supabase, projectId)
    return projectCreator === userId
}

export async function checkCustomPermission(
    supabase: SupabaseClient,
    userId: string,
    projectId: number,
    permissionType: string
): Promise<boolean> {
    const { data: customPermission } = await supabase
        .from('user_project_permissions')
        .select(`*`)
        .eq('userid', userId)
        .eq('projectid', projectId)
        .eq('is_active', true)
        .single()

    if (customPermission) {
        if (customPermission.expires_at && new Date(customPermission.expires_at) < new Date()) {
            return false
        }

        switch (permissionType) {
            case 'create_phase':
                return customPermission.can_create_phase
            case 'edit_phase':
                return customPermission.can_edit_phase
            case 'delete_phase':
                return customPermission.can_delete_phase
            case 'create_task':
                return customPermission.can_create_task
            case 'edit_task':
                return customPermission.can_edit_task
            case 'delete_task':
                return customPermission.can_delete_task
            case 'assign_task':
                return customPermission.can_assign_task
            case 'delete_project':
                return customPermission.can_delete_project
            case 'view_project':
            case 'view_phase':
            case 'view_task':
                return true
            default:
                return false
        }
    }

    return false
}

export async function checkPhasePermission(
    supabase: SupabaseClient,
    userId: string,
    projectId: number,
    action: 'create' | 'update' | 'delete' | 'view'
): Promise<boolean> {
    const user = await getUserWithRole(supabase, userId)
    if (!user) return false

    const { data: project } = await supabase
        .from('projects')
        .select('createdbyuserid')
        .eq('projectid', projectId)
        .single()

    if (!project) return false

    const isProjectCreator = project.createdbyuserid === userId

    const { data: assignmentData } = await supabase
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

    const isAssigned = assignmentData && assignmentData.length > 0

    // Check if user has any custom permission for elevated privileges
    const { data: anyCustomPermission } = await supabase
        .from('user_project_permissions')
        .select('permissionid')
        .eq('userid', userId)
        .eq('projectid', projectId)
        .eq('is_active', true)
        .single()

    const hasCustomPermission = !!anyCustomPermission

    switch (user.role) {
        case 'admin':
        case 'project_manager':
            return true

        case 'lead_full_stack_developer':
            if (action === 'delete') {
                return isAssigned || isProjectCreator || hasCustomPermission
            }
            return action === 'create' || action === 'update' || action === 'view' || hasCustomPermission

        case 'full_stack_developer':
            if (hasCustomPermission) {
                return action === 'create' || action === 'update' || action === 'view'
            }
            return action === 'update' || action === 'view'

        case 'client':
            return action === 'view' && (isProjectCreator || hasCustomPermission)

        default:
            return false
    }
}

export async function checkTaskPermission(
    supabase: SupabaseClient,
    userId: string,
    projectId: number,
    action: 'create' | 'update' | 'delete' | 'view'
): Promise<boolean> {
    const user = await getUserWithRole(supabase, userId)
    if (!user) return false

    const { data: project } = await supabase
        .from('projects')
        .select('createdbyuserid')
        .eq('projectid', projectId)
        .single()

    if (!project) return false

    const isProjectCreator = project.createdbyuserid === userId

    const { data: assignmentData } = await supabase
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

    const isAssigned = assignmentData && assignmentData.length > 0

    // Check if user has any custom permission for elevated privileges
    const { data: anyCustomPermission } = await supabase
        .from('user_project_permissions')
        .select('permissionid')
        .eq('userid', userId)
        .eq('projectid', projectId)
        .eq('is_active', true)
        .single()

    const hasCustomPermission = !!anyCustomPermission

    switch (user.role) {
        case 'admin':
        case 'project_manager':
            return true

        case 'lead_full_stack_developer':
            if (action === 'delete') {
                return isAssigned || isProjectCreator || hasCustomPermission
            }
            return action === 'create' || action === 'update' || action === 'view' || hasCustomPermission

        case 'full_stack_developer':
            if (hasCustomPermission) {
                return action === 'create' || action === 'update' || action === 'view'
            }
            return action === 'update' || action === 'view'

        case 'client':
            return action === 'view' && (isProjectCreator || hasCustomPermission)

        default:
            return false
    }
}

export async function hasPermission(
    supabase: SupabaseClient,
    userId: string,
    projectId: number,
    permissionType: string
): Promise<boolean> {
    // First check custom permissions
    const hasCustomPermission = await checkCustomPermission(supabase, userId, projectId, permissionType)
    if (hasCustomPermission) return true

    // Check if user has ANY custom permission for elevated privileges
    const { data: anyCustomPermission } = await supabase
        .from('user_project_permissions')
        .select('permissionid')
        .eq('userid', userId)
        .eq('projectid', projectId)
        .eq('is_active', true)
        .single()

    if (anyCustomPermission) {
        switch (permissionType) {
            case 'create_phase':
            case 'edit_phase':
            case 'create_task':
            case 'edit_task':
            case 'assign_task':
                return true
        }
    }

    const user = await getUserWithRole(supabase, userId)
    if (!user) return false

    let action: string = ''
    switch (permissionType) {
        case 'create_phase':
        case 'create_task':
            action = 'create'
            break
        case 'edit_phase':
        case 'edit_task':
        case 'edit_project':
        case 'assign_task':
            action = 'update'
            break
        case 'delete_phase':
        case 'delete_task':
        case 'delete_project':
            action = 'delete'
            break
        case 'view_project':
        case 'view_phase':
        case 'view_task':
            action = 'view'
            break
        default:
            return false
    }

    if (permissionType.includes('phase')) {
        return checkPhasePermission(supabase, userId, projectId, action as any)
    } else if (permissionType.includes('task')) {
        return checkTaskPermission(supabase, userId, projectId, action as any)
    } else if (permissionType.includes('project')) {
        switch (permissionType) {
            case 'edit_project':
                return ['admin', 'project_manager'].includes(user.role)
            case 'delete_project':
                return canDeleteProject(supabase, userId, projectId)
            case 'view_project':
                return true
            default:
                return false
        }
    }

    return false
}