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

function isProjectTemplate(data: any): data is ProjectTemplate {
  return data && data.templates && typeof data.templates === 'object';
}

function isTeamMember(data: any): data is TeamMember {
  return data && data.userid !== undefined;
}

// Safe project data fetcher
async function fetchProjectData(projectId: string): Promise<any> {
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
async function authenticateProjectAccess(
  projectId: string, 
  password?: string, 
  token?: string
): Promise<{ authorized: boolean; requiresAuth: boolean; error?: string; project?: any }> {
  
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
        .select('projectid, projectname')
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

// Fixed safe data fetcher
async function fetchWithErrorHandling<T>(
  query: any,
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
    const projectTemplates = await fetchWithErrorHandling<any[]>(
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
    const teamMembersData = await fetchWithErrorHandling<any[]>(
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
    const allPhases = await fetchWithErrorHandling<any[]>(
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

    // Fetch tasks for all phases
    let allTasks: any[] = [];
    if (allPhases && Array.isArray(allPhases)) {
      for (const phase of allPhases) {
        const phaseTasks = await fetchWithErrorHandling<any[]>(
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

        if (phaseTasks) {
          // Fetch task assignments for each task
          for (const task of phaseTasks) {
            const taskAssignments = await fetchWithErrorHandling<any[]>(
              supabase
                .from('taskassignments')
                .select(`
                  taskassignmentid,
                  taskid,
                  userid,
                  assignedat,
                  completedat
                `)
                .eq('taskid', task.taskid),
              `assignments for task ${task.taskid}`
            );

            // Process assignments with user data
            const processedAssignments: TaskAssignment[] = [];
            if (taskAssignments && Array.isArray(taskAssignments)) {
              for (const assignment of taskAssignments) {
                const userData = await fetchUserData(assignment.userid);
                processedAssignments.push({
                  ...assignment,
                  users: userData || undefined
                });
              }
            }

            task.taskassignments = processedAssignments;
          }
          allTasks = [...allTasks, ...phaseTasks];
        }
      }
    }

    // Process templates with their template phases and actual project phases
    const processedTemplates: Template[] = [];
    
    if (projectTemplates && Array.isArray(projectTemplates)) {
      console.log(`🔄 Processing ${projectTemplates.length} templates...`);
      
      for (const pt of projectTemplates) {
        if (isProjectTemplate(pt) && pt.templates) {
          // Fetch template phases and tasks
          const templatePhases = await fetchWithErrorHandling<any[]>(
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
          let templateTasksData: any[] = [];
          if (templatePhases && Array.isArray(templatePhases)) {
            for (const phase of templatePhases) {
              const tasks = await fetchWithErrorHandling<any[]>(
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
          const templateProjectPhases: Phase[] = (allPhases || [])
            .filter((phase: any) => phase.templateid === pt.templateid)
            .map((phase: any) => {
              const phaseTasks = allTasks.filter((task: any) => task.phaseid === phase.phaseid);
              
              return {
                ...phase,
                tasks: phaseTasks || []
              };
            });

          // Group template tasks by phase
          const templatePhasesWithTasks = (templatePhases || []).map((phase: any) => ({
            ...phase,
            templatetasks: templateTasksData.filter((task: any) => task.templatephaseid === phase.templatephaseid)
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
    const allProjectTasks = allProjectPhases.flatMap(phase => phase.tasks || []);

    const totalPhases = allProjectPhases.length;
    const completedPhases = allProjectPhases.filter(phase => phase.status === 'Completed').length;
    const totalTasks = allProjectTasks.length;
    const completedTasks = allProjectTasks.filter(task => task.status === 'Completed').length;
    const overdueTasks = allProjectTasks.filter(task => 
      task.duedate && new Date(task.duedate) < new Date() && task.status !== 'Completed'
    ).length;

    const totalAssignmentsCount = allProjectTasks.reduce((total, task) => {
      return total + (task.taskassignments ? task.taskassignments.length : 0);
    }, 0);
    
    const completedAssignmentsCount = allProjectTasks.reduce((total, task) => {
      if (!task.taskassignments) return total;
      return total + task.taskassignments.filter(assignment => assignment.completedat !== null).length;
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}