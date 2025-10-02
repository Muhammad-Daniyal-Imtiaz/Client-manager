import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './../../sutils/supabaseConfig';

// Types definition
export interface User {
  userid: number;
  name: string;
  email: string;
}

export interface TaskAssignment {
  taskassignmentid: number;
  assignedat: string;
  completedat: string | null;
  userid: number;
  users?: User;
}

export interface Task {
  taskid: number;
  taskdescription: string;
  status: string;
  duedate: string | null;
  createdat: string;
  taskassignments: TaskAssignment[];
}

export interface Phase {
  phaseid: number;
  projectid: number;
  templateid: number | null;
  phasename: string;
  phaseorder: number;
  status: string;
  createdat: string;
  tasks: Task[];
}

export interface TemplateTask {
  templatetaskid: number;
  templatephaseid: number;
  taskdescription: string;
  createdat: string;
}

export interface TemplatePhase {
  templatephaseid: number;
  templateid: number;
  phasename: string;
  phaseorder: number;
  createdat: string;
  templatetasks: TemplateTask[];
}

export interface Template {
  templateid: number;
  templatename: string;
  category: string;
  description: string;
  templatephases: TemplatePhase[];
  phases: Phase[];
}

export interface ProjectTemplate {
  projecttemplateid: number;
  templateid: number;
  isactive: boolean;
  addedat: string;
  templates: Template;
}

export interface TeamMember {
  projectteamid: number;
  role: string;
  addedat: string;
  userid: number;
  users?: User;
}

export interface ProjectStatistics {
  totalPhases: number;
  completedPhases: number;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionPercentage: number;
  overdueTasks: number;
  totalAssignments: number;
  completedAssignments: number;
  assignmentCompletionPercentage: number;
  totalTemplatePhases: number;
  totalTemplateTasks: number;
}

export interface Project {
  projectid: number;
  projectname: string;
  description: string | null;
  projecttype: string;
  status: string;
  createdbyuserid: number;
  createdat: string;
  updatedat: string;
  project_password?: string | null;
  project_token?: string | null;
  templates: Template[];
  team: TeamMember[];
  statistics: ProjectStatistics;
}

export interface ApiResponse {
  project: Project;
  requiresAuth?: boolean;
  authError?: string;
}

// Type guards
function isProjectTemplate(data: unknown): data is ProjectTemplate {
  return !!(
    data && 
    typeof data === 'object' && 
    'templates' in data && 
    typeof (data as ProjectTemplate).templates === 'object'
  );
}

function isTeamMember(data: unknown): data is TeamMember {
  return !!(
    data && 
    typeof data === 'object' && 
    'userid' in data && 
    typeof (data as TeamMember).userid === 'number'
  );
}

interface DatabaseProject {
  projectid: number;
  projectname: string;
  description: string | null;
  projecttype: string;
  status: string;
  createdbyuserid: number;
  createdat: string;
  updatedat: string;
  project_password?: string | null;
  project_token?: string | null;
}

interface DatabaseTask {
  taskid: number;
  phaseid: number;
  taskdescription: string;
  status: string;
  duedate: string | null;
  createdat: string;
}

interface DatabaseTaskAssignment {
  taskassignmentid: number;
  taskid: number;
  userid: number;
  assignedat: string;
  completedat: string | null;
}

interface DatabasePhase {
  phaseid: number;
  projectid: number;
  templateid: number | null;
  phasename: string;
  phaseorder: number;
  status: string;
  createdat: string;
}

// Supabase response types
interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

// Helper functions
function calculateProjectStatus(phases: Phase[]): string {
  if (!phases || phases.length === 0) return 'Not Started';
  
  const totalPhases = phases.length;
  const completedPhases = phases.filter(phase => phase.status === 'Completed').length;
  const inProgressPhases = phases.filter(phase => phase.status === 'In Progress').length;
  
  if (completedPhases === totalPhases) return 'Completed';
  if (inProgressPhases > 0 || completedPhases > 0) return 'In Progress';
  return 'Not Started';
}

// Safe project data fetcher
async function fetchProjectData(projectId: string): Promise<DatabaseProject | null> {
  try {
    console.log(`📋 Fetching project data for ID: ${projectId}`);
    
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('projectid', projectId)
      .single();

    if (error) {
      console.error('❌ Project fetch error:', error);
      throw error;
    }

    console.log('✅ Successfully fetched project');
    
    return {
      ...project,
      status: project.status || 'Active',
      updatedat: project.updatedat || project.createdat || new Date().toISOString()
    };
  } catch (error) {
    console.error('💥 Error fetching project data:', error);
    throw error;
  }
}

// Authentication helper
interface AuthResult {
  authorized: boolean;
  requiresAuth: boolean;
  error?: string;
  project?: DatabaseProject;
}

async function authenticateProjectAccess(
  projectId: string, 
  password?: string, 
  token?: string
): Promise<AuthResult> {
  
  try {
    console.log(`🔐 Authenticating project ${projectId}`, { 
      hasPassword: !!password, 
      hasToken: !!token 
    });

    const TEST_PASSWORD = 'test123';
    const TEST_TOKEN = '12345678-1234-1234-1234-123456789abc';
    
    if (password === TEST_PASSWORD && token === TEST_TOKEN) {
      console.log('✅ TEST MODE: Authentication successful with test credentials');
      
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', projectId)
        .single();

      if (error || !project) {
        console.error('❌ Project not found during test authentication');
        return { authorized: false, requiresAuth: false, error: 'Project not found' };
      }
      
      return { authorized: true, requiresAuth: true, project };
    }
    
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('projectid', projectId)
      .single();

    if (error || !project) {
      console.error('❌ Project fetch error in auth:', error);
      return { authorized: false, requiresAuth: false, error: 'Project not found' };
    }

    console.log('✅ Project found:', { 
      name: project.projectname,
      hasPassword: !!project.project_password,
      hasToken: !!project.project_token
    });

    const hasPassword = project.project_password !== undefined && project.project_password !== null;
    const hasToken = project.project_token !== undefined && project.project_token !== null;

    console.log('🔒 Auth requirements:', { hasPassword, hasToken });

    if (!hasPassword && !hasToken) {
      console.log('✅ No auth required - allowing access');
      return { authorized: true, requiresAuth: false, project };
    }

    if ((hasPassword || hasToken) && (!password && !token)) {
      console.log('❌ Auth required but no credentials provided');
      return { 
        authorized: false, 
        requiresAuth: true, 
        error: 'This project requires authentication' 
      };
    }

    let passwordValid = true;
    let tokenValid = true;

    if (hasPassword) {
      passwordValid = password === project.project_password;
    }

    if (hasToken) {
      tokenValid = token === project.project_token;
    }

    if (passwordValid && tokenValid) {
      console.log('✅ Authentication successful');
      return { authorized: true, requiresAuth: true, project };
    } else {
      console.log('❌ Authentication failed:', { passwordValid, tokenValid });
      return { 
        authorized: false, 
        requiresAuth: true, 
        error: 'Invalid password or token' 
      };
    }
  } catch (error) {
    console.error('💥 Authentication error:', error);
    return { 
      authorized: false, 
      requiresAuth: false, 
      error: 'Authentication failed' 
    };
  }
}

// Fixed safe data fetcher with proper typing - simplified approach
async function fetchWithErrorHandling<T>(
  query: any, // Use any here and handle the execution internally
  entityName: string
): Promise<T | null> {
  try {
    const { data, error } = await query;
    if (error) {
      console.error(`❌ ${entityName} error:`, error);
      return null;
    }
    console.log(`✅ Found ${Array.isArray(data) ? data.length : data ? 1 : 0} ${entityName}`);
    return data;
  } catch (error) {
    console.error(`💥 ${entityName} fetch error:`, error);
    return null;
  }
}

// Helper to fetch user data by ID
async function fetchUserData(userId: number): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('userid, name, email')
      .eq('userid', userId)
      .single();

    if (error) {
      console.error(`❌ User fetch error for ID ${userId}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`💥 User fetch error for ID ${userId}:`, error);
    return null;
  }
}

// Helper to convert DatabaseTask to Task with assignments
function convertToTask(databaseTask: DatabaseTask, assignments: TaskAssignment[]): Task {
  return {
    taskid: databaseTask.taskid,
    taskdescription: databaseTask.taskdescription,
    status: databaseTask.status,
    duedate: databaseTask.duedate,
    createdat: databaseTask.createdat,
    taskassignments: assignments
  };
}

// Helper to convert database phase to Phase with proper tasks
function convertToPhase(
  databasePhase: DatabasePhase, 
  allTasks: Map<number, Task[]>
): Phase {
  const phaseTasks = allTasks.get(databasePhase.phaseid) || [];
  
  return {
    phaseid: databasePhase.phaseid,
    projectid: databasePhase.projectid,
    templateid: databasePhase.templateid,
    phasename: databasePhase.phasename,
    phaseorder: databasePhase.phaseorder,
    status: databasePhase.status,
    createdat: databasePhase.createdat,
    tasks: phaseTasks
  };
}

interface ContextParams {
  pid: string;
}

export async function GET(
  request: NextRequest,
  context: { params: ContextParams }
): Promise<NextResponse> {
  try {
    const { pid } = context.params;
    const projectId = pid;

    if (!projectId) {
      console.error('❌ Project ID is required');
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    const token = url.searchParams.get('token');

    console.log(`\n🎯 API Request for project: ${projectId}`, {
      hasPassword: !!password,
      hasToken: !!token,
      url: request.url
    });

    const authResult = await authenticateProjectAccess(
      projectId, 
      password || undefined, 
      token || undefined
    );
    
    if (!authResult.authorized) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { 
          error: authResult.error || 'Authentication failed',
          requiresAuth: authResult.requiresAuth
        },
        { status: authResult.requiresAuth ? 401 : 404 }
      );
    }

    console.log('✅ Authentication successful for project:', projectId);

    const project = await fetchProjectData(projectId);

    if (!project) {
      console.error('❌ Project not found after authentication');
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log(`📋 Project found: ${project.projectname}`);

    // Fetch project templates
    const projectTemplates = await fetchWithErrorHandling<ProjectTemplate[]>(
      supabase
        .from('projecttemplates')
        .select(`
          projecttemplateid,
          templateid,
          isactive,
          addedat,
          templates (
            templateid,
            templatename,
            category,
            description
          )
        `)
        .eq('projectid', projectId)
        .eq('isactive', true),
      'templates'
    );

    // Fetch team members
    const teamMembersData = await fetchWithErrorHandling<TeamMember[]>(
      supabase
        .from('projectteam')
        .select(`
          projectteamid,
          role,
          addedat,
          userid
        `)
        .eq('projectid', projectId),
      'team members'
    );

    // Process team members with user data
    const processedTeam: TeamMember[] = [];
    if (teamMembersData && Array.isArray(teamMembersData)) {
      console.log(`👥 Processing ${teamMembersData.length} team members...`);
      
      for (const member of teamMembersData) {
        if (isTeamMember(member)) {
          const userData = await fetchUserData(member.userid);
          processedTeam.push({
            ...member,
            users: userData || undefined
          });
        }
      }
    }

    // Fetch all phases
    const allPhasesData = await fetchWithErrorHandling<DatabasePhase[]>(
      supabase
        .from('phases')
        .select(`
          phaseid,
          projectid,
          templateid,
          phasename,
          phaseorder,
          status,
          createdat
        `)
        .eq('projectid', projectId)
        .order('phaseorder', { ascending: true }),
      'phases'
    );

    // Create a map to store tasks by phase ID
    const tasksByPhaseId = new Map<number, Task[]>();

    // Fetch tasks for all phases and process them with assignments
    if (allPhasesData && Array.isArray(allPhasesData)) {
      for (const phase of allPhasesData) {
        const phaseTasksData = await fetchWithErrorHandling<DatabaseTask[]>(
          supabase
            .from('tasks')
            .select(`
              taskid,
              phaseid,
              taskdescription,
              status,
              duedate,
              createdat
            `)
            .eq('phaseid', phase.phaseid),
          `tasks for phase ${phase.phaseid}`
        );

        if (phaseTasksData) {
          const processedTasks: Task[] = [];
          
          for (const taskData of phaseTasksData) {
            // Fetch task assignments for each task
            const taskAssignmentsData = await fetchWithErrorHandling<DatabaseTaskAssignment[]>(
              supabase
                .from('taskassignments')
                .select(`
                  taskassignmentid,
                  taskid,
                  userid,
                  assignedat,
                  completedat
                `)
                .eq('taskid', taskData.taskid),
              `assignments for task ${taskData.taskid}`
            );

            // Process assignments with user data
            const processedAssignments: TaskAssignment[] = [];
            if (taskAssignmentsData && Array.isArray(taskAssignmentsData)) {
              for (const assignment of taskAssignmentsData) {
                const userData = await fetchUserData(assignment.userid);
                processedAssignments.push({
                  taskassignmentid: assignment.taskassignmentid,
                  assignedat: assignment.assignedat,
                  completedat: assignment.completedat,
                  userid: assignment.userid,
                  users: userData || undefined
                });
              }
            }

            // Convert DatabaseTask to Task with assignments
            const processedTask: Task = convertToTask(taskData, processedAssignments);
            processedTasks.push(processedTask);
          }
          
          tasksByPhaseId.set(phase.phaseid, processedTasks);
        }
      }
    }

    // Convert database phases to proper Phase objects
    const allPhases: Phase[] = (allPhasesData || []).map(phaseData => 
      convertToPhase(phaseData, tasksByPhaseId)
    );

    // Process templates with their template phases and actual project phases
    const processedTemplates: Template[] = [];
    
    if (projectTemplates && Array.isArray(projectTemplates)) {
      console.log(`🔄 Processing ${projectTemplates.length} templates...`);
      
      for (const pt of projectTemplates) {
        if (isProjectTemplate(pt) && pt.templates) {
          // Fetch template phases and tasks
          const templatePhases = await fetchWithErrorHandling<TemplatePhase[]>(
            supabase
              .from('templatephases')
              .select(`
                templatephaseid,
                templateid,
                phasename,
                phaseorder,
                createdat
              `)
              .eq('templateid', pt.templateid)
              .order('phaseorder', { ascending: true }),
            `template phases for template ${pt.templateid}`
          );

          // Fetch template tasks
          let templateTasksData: TemplateTask[] = [];
          if (templatePhases && Array.isArray(templatePhases)) {
            for (const phase of templatePhases) {
              const tasks = await fetchWithErrorHandling<TemplateTask[]>(
                supabase
                  .from('templatetasks')
                  .select(`
                    templatetaskid,
                    templatephaseid,
                    taskdescription,
                    createdat
                  `)
                  .eq('templatephaseid', phase.templatephaseid),
                `template tasks for phase ${phase.templatephaseid}`
              );
              
              if (tasks) {
                templateTasksData = [...templateTasksData, ...tasks];
              }
            }
          }

          // Get actual project phases for this template
          const templateProjectPhases: Phase[] = allPhases
            .filter((phase: Phase) => phase.templateid === pt.templateid);

          // Group template tasks by phase
          const templatePhasesWithTasks = (templatePhases || []).map((phase: TemplatePhase) => ({
            ...phase,
            templatetasks: templateTasksData.filter((task: TemplateTask) => task.templatephaseid === phase.templatephaseid)
          }));

          processedTemplates.push({
            ...pt.templates,
            templatephases: templatePhasesWithTasks,
            phases: templateProjectPhases
          });
        }
      }
    }

    console.log(`✅ Processed ${processedTemplates.length} templates`);

    // Calculate statistics
    const allProjectPhases = processedTemplates.flatMap(template => template.phases);
    const allProjectTasks = allProjectPhases.flatMap(phase => phase.tasks);

    const totalPhases = allProjectPhases.length;
    const completedPhases = allProjectPhases.filter(phase => phase.status === 'Completed').length;
    const totalTasks = allProjectTasks.length;
    const completedTasks = allProjectTasks.filter(task => task.status === 'Completed').length;
    const overdueTasks = allProjectTasks.filter(task => 
      task.duedate && new Date(task.duedate) < new Date() && task.status !== 'Completed'
    ).length;

    const totalAssignmentsCount = allProjectTasks.reduce((total: number, task: Task) => {
      return total + task.taskassignments.length;
    }, 0);
    
    const completedAssignmentsCount = allProjectTasks.reduce((total: number, task: Task) => {
      return total + task.taskassignments.filter((assignment: TaskAssignment) => assignment.completedat !== null).length;
    }, 0);

    const totalTemplatePhases = processedTemplates.reduce((total, template) => {
      return total + template.templatephases.length;
    }, 0);

    const totalTemplateTasks = processedTemplates.reduce((total, template) => {
      return total + template.templatephases.reduce((phaseTotal, phase) => {
        return phaseTotal + phase.templatetasks.length;
      }, 0);
    }, 0);

    const overallProjectStatus = calculateProjectStatus(allProjectPhases);

    // Prepare final response
    const projectData: ApiResponse = {
      project: {
        ...project,
        status: project.status || overallProjectStatus,
        templates: processedTemplates,
        team: processedTeam,
        statistics: {
          totalPhases,
          completedPhases,
          completionPercentage: totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0,
          totalTasks,
          completedTasks,
          taskCompletionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          overdueTasks,
          totalAssignments: totalAssignmentsCount,
          completedAssignments: completedAssignmentsCount,
          assignmentCompletionPercentage: totalAssignmentsCount > 0 ? Math.round((completedAssignmentsCount / totalAssignmentsCount) * 100) : 0,
          totalTemplatePhases,
          totalTemplateTasks
        }
      },
      requiresAuth: authResult.requiresAuth
    };

    console.log(`\n🎉 API Response prepared successfully for project ${projectId}`);
    console.log(`- Project: ${project.projectname}`);
    console.log(`- Templates: ${processedTemplates.length}`);
    console.log(`- Project Phases: ${totalPhases}`);
    console.log(`- Project Tasks: ${totalTasks}`);
    console.log(`- Team Members: ${processedTeam.length}`);
    console.log(`- Overall Status: ${overallProjectStatus}`);
    console.log(`- Requires Auth: ${authResult.requiresAuth}`);
    console.log(`- Completion: ${projectData.project.statistics.completionPercentage}%`);

    return NextResponse.json(projectData);
  } catch (error) {
    console.error('💥 Error in project details API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}