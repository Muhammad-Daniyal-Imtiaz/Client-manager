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
  users: User;
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
  phases: Phase[]; // Actual project phases for this template
}

export interface ProjectTemplate {
  templateid: number;
  isactive: boolean;
  addedat: string;
  templates: Template;
}

export interface TeamMember {
  projectteamid: number;
  role: string;
  addedat: string;
  user: User;
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
  templates: Template[];
  team: TeamMember[];
  statistics: ProjectStatistics;
}

export interface ApiResponse {
  project: Project;
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

function calculatePhaseStatus(tasks: Task[]): string {
  if (!tasks || tasks.length === 0) return 'Not Started';
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  
  if (completedTasks === totalTasks) return 'Completed';
  if (inProgressTasks > 0 || completedTasks > 0) return 'In Progress';
  return 'Not Started';
}

function isProjectTemplate(data: any): data is ProjectTemplate {
  return data && data.templates && typeof data.templates === 'object';
}

function isTeamMember(data: any): data is TeamMember {
  return data && data.users && typeof data.users === 'object';
}

function isPhase(data: any): data is Phase {
  return data && data.phaseid !== undefined;
}

function isTask(data: any): data is Task {
  return data && data.taskid !== undefined;
}

function isTaskAssignment(data: any): data is TaskAssignment {
  return data && data.taskassignmentid !== undefined;
}

export async function GET(
  request: NextRequest,
  context: { params: { pid: string } }
): Promise<NextResponse> {
  try {
    // Await the params to fix the dynamic API route issue
    const { pid } = await Promise.resolve(context.params);
    const projectId = pid;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching project details for ID: ${projectId}`);

    // Fetch project basic details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('projectid', projectId)
      .single();

    if (projectError) {
      console.error('Project fetch error:', projectError);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log(`Project found: ${project.projectname}`);

    // Fetch project templates
    const { data: projectTemplates, error: templatesError } = await supabase
      .from('projecttemplates')
      .select(`
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
      .eq('isactive', true);

    if (templatesError) {
      console.error('Templates error:', templatesError);
    } else {
      console.log(`Found ${projectTemplates?.length || 0} active templates`);
    }

    // Fetch team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('projectteam')
      .select(`
        projectteamid,
        role,
        addedat,
        users (
          userid,
          name,
          email
        )
      `)
      .eq('projectid', projectId);

    if (teamError) {
      console.error('Team error:', teamError);
    } else {
      console.log(`Found ${teamMembers?.length || 0} team members`);
    }

    // Fetch all phases with their tasks and assignments
    const { data: allPhases, error: phasesError } = await supabase
      .from('phases')
      .select(`
        phaseid,
        projectid,
        templateid,
        phasename,
        phaseorder,
        status,
        createdat,
        tasks (
          taskid,
          taskdescription,
          status,
          duedate,
          createdat,
          taskassignments (
            taskassignmentid,
            assignedat,
            completedat,
            users (
              userid,
              name,
              email
            )
          )
        )
      `)
      .eq('projectid', projectId)
      .order('phaseorder', { ascending: true });

    if (phasesError) {
      console.error('Phases error:', phasesError);
    } else {
      console.log(`Found ${allPhases?.length || 0} phases`);
    }

    // Process templates with their template phases and actual project phases
    const processedTemplates: Template[] = [];
    
    if (projectTemplates && Array.isArray(projectTemplates)) {
      for (const pt of projectTemplates) {
        if (isProjectTemplate(pt) && pt.templates) {
          // Fetch template phases and tasks
          const { data: templatePhases, error: templatePhasesError } = await supabase
            .from('templatephases')
            .select(`
              templatephaseid,
              templateid,
              phasename,
              phaseorder,
              createdat,
              templatetasks (
                templatetaskid,
                templatephaseid,
                taskdescription,
                createdat
              )
            `)
            .eq('templateid', pt.templateid)
            .order('phaseorder', { ascending: true });

          // Get actual project phases for this template
          const templateProjectPhases: Phase[] = (allPhases || [])
            .filter((phase: any) => phase.templateid === pt.templateid)
            .map((phase: any) => {
              if (isPhase(phase)) {
                const processedTasks: Task[] = [];
                if (phase.tasks && Array.isArray(phase.tasks)) {
                  phase.tasks.forEach((task: any) => {
                    if (isTask(task)) {
                      const processedAssignments: TaskAssignment[] = [];
                      if (task.taskassignments && Array.isArray(task.taskassignments)) {
                        task.taskassignments.forEach((assignment: any) => {
                          if (isTaskAssignment(assignment) && assignment.users) {
                            processedAssignments.push({
                              taskassignmentid: assignment.taskassignmentid,
                              assignedat: assignment.assignedat,
                              completedat: assignment.completedat,
                              users: assignment.users
                            });
                          }
                        });
                      }

                      processedTasks.push({
                        taskid: task.taskid,
                        taskdescription: task.taskdescription,
                        status: task.status,
                        duedate: task.duedate,
                        createdat: task.createdat,
                        taskassignments: processedAssignments
                      });
                    }
                  });
                }

                const calculatedStatus = calculatePhaseStatus(processedTasks);
                
                return {
                  phaseid: phase.phaseid,
                  projectid: phase.projectid,
                  templateid: phase.templateid,
                  phasename: phase.phasename,
                  phaseorder: phase.phaseorder,
                  status: phase.status || calculatedStatus,
                  createdat: phase.createdat,
                  tasks: processedTasks
                };
              }
              return phase;
            });

          processedTemplates.push({
            ...pt.templates,
            templatephases: templatePhasesError ? [] : (templatePhases as TemplatePhase[] || []),
            phases: templateProjectPhases
          });
        }
      }
    }

    console.log(`Processed ${processedTemplates.length} templates`);

    // Process team members data
    const processedTeam: TeamMember[] = [];
    if (teamMembers && Array.isArray(teamMembers)) {
      teamMembers.forEach((member: any) => {
        if (isTeamMember(member) && member.users) {
          processedTeam.push({
            projectteamid: member.projectteamid,
            role: member.role,
            addedat: member.addedat,
            user: member.users
          });
        }
      });
    }

    console.log(`Processed ${processedTeam.length} team members`);

    // Calculate statistics from all templates' phases
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
      }
    };

    console.log(`API Response prepared successfully for project ${projectId}`);
    console.log(`- Templates: ${processedTemplates.length}`);
    console.log(`- Project Phases: ${totalPhases}`);
    console.log(`- Project Tasks: ${totalTasks}`);
    console.log(`- Team Members: ${processedTeam.length}`);
    console.log(`- Overall Status: ${overallProjectStatus}`);

    return NextResponse.json(projectData);
  } catch (error) {
    console.error('Error in project details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}