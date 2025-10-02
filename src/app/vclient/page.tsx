'use client';

import { JSX, useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Building,
  Target,
  BarChart3,
  Workflow,
  FolderOpen,
  FolderClosed
} from 'lucide-react';

// Import types from API
interface User {
  userid: number;
  name: string;
  email: string;
}

interface TaskAssignment {
  taskassignmentid: number;
  assignedat: string;
  completedat: string | null;
  users: User;
}

interface Task {
  taskid: number;
  taskdescription: string;
  status: string;
  duedate: string | null;
  createdat: string;
  taskassignments: TaskAssignment[];
}

interface Phase {
  phaseid: number;
  projectid: number;
  templateid: number | null;
  phasename: string;
  phaseorder: number;
  status: string;
  createdat: string;
  tasks: Task[];
}

interface TemplateTask {
  templatetaskid: number;
  templatephaseid: number;
  taskdescription: string;
  createdat: string;
}

interface TemplatePhase {
  templatephaseid: number;
  templateid: number;
  phasename: string;
  phaseorder: number;
  createdat: string;
  templatetasks: TemplateTask[];
}

interface Template {
  templateid: number;
  templatename: string;
  category: string;
  description: string;
  templatephases: TemplatePhase[];
  phases: Phase[];
}

interface TeamMember {
  projectteamid: number;
  role: string;
  addedat: string;
  user: User;
}

interface ProjectStatistics {
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

interface Project {
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

interface ApiResponse {
  project: Project;
}

// Progress calculation utilities
const calculatePhaseProgress = (phase: Phase): { percentage: number; completed: number; total: number; status: string } => {
  const totalTasks = phase.tasks.length;
  const completedTasks = phase.tasks.filter(task => task.status === 'Completed').length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  let status = 'Not Started';
  if (completedTasks === totalTasks && totalTasks > 0) {
    status = 'Completed';
  } else if (completedTasks > 0 || phase.tasks.some(task => task.status === 'In Progress')) {
    status = 'In Progress';
  }
  
  return { percentage, completed: completedTasks, total: totalTasks, status };
};

const calculateTemplateProgress = (template: Template): { percentage: number; completedPhases: number; totalPhases: number; completedTasks: number; totalTasks: number } => {
  const templatePhases = template.phases || [];
  const totalPhases = templatePhases.length;
  
  // Calculate based on tasks (more granular)
  const allTasks = templatePhases.flatMap(phase => phase.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.status === 'Completed').length;
  
  // Calculate completed phases (all tasks in phase must be completed)
  const completedPhases = templatePhases.filter(phase => {
    const phaseProgress = calculatePhaseProgress(phase);
    return phaseProgress.status === 'Completed';
  }).length;
  
  // Use task-based percentage for more accurate progress
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return { percentage, completedPhases, totalPhases, completedTasks, totalTasks };
};

const calculateProjectStatistics = (templates: Template[]): ProjectStatistics => {
  const allPhases = templates.flatMap(template => template.phases);
  const allTasks = allPhases.flatMap(phase => phase.tasks);
  
  const totalPhases = allPhases.length;
  const completedPhases = allPhases.filter(phase => {
    const progress = calculatePhaseProgress(phase);
    return progress.status === 'Completed';
  }).length;
  
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.status === 'Completed').length;
  const overdueTasks = allTasks.filter(task => 
    task.duedate && new Date(task.duedate) < new Date() && task.status !== 'Completed'
  ).length;

  const totalAssignmentsCount = allTasks.reduce((total, task) => {
    return total + (task.taskassignments ? task.taskassignments.length : 0);
  }, 0);
  
  const completedAssignmentsCount = allTasks.reduce((total, task) => {
    if (!task.taskassignments) return total;
    return total + task.taskassignments.filter(assignment => assignment.completedat !== null).length;
  }, 0);

  const totalTemplatePhases = templates.reduce((total, template) => {
    return total + template.templatephases.length;
  }, 0);

  const totalTemplateTasks = templates.reduce((total, template) => {
    return total + template.templatephases.reduce((phaseTotal, phase) => {
      return phaseTotal + phase.templatetasks.length;
    }, 0);
  }, 0);

  return {
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
  };
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getVariant = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'Completed': 'default',
      'In Progress': 'secondary',
      'Not Started': 'outline',
      'On Hold': 'outline',
      'Cancelled': 'destructive',
      'Overdue': 'destructive',
      'Assigned': 'secondary',
      'Active': 'default',
    };
    
    return variants[status] || 'outline';
  };

  return (
    <Badge variant={getVariant(status)} className="capitalize">
      {status.toLowerCase()}
    </Badge>
  );
};

// Template Badge for Categories
const TemplateBadge = ({ category }: { category: string }) => {
  const getVariant = (category: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      'SEO': 'default',
      'Email Marketing': 'secondary',
      'Social Media': 'outline',
      'Automation': 'default',
      'Graphic Design': 'secondary',
    };
    
    return variants[category] || 'outline';
  };

  return (
    <Badge variant={getVariant(category)}>
      {category}
    </Badge>
  );
};

// Progress Display Component
const ProgressDisplay = ({ 
  value, 
  label, 
  sublabel,
  icon: Icon 
}: { 
  value: number; 
  label: string; 
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
    {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
  </div>
);

// Task Card Component
const TaskCard = ({ task }: { task: Task }) => {
  const isOverdue = task.duedate && new Date(task.duedate) < new Date() && task.status !== 'Completed';
  const assignmentStatus = task.taskassignments.length > 0 ? 
    (task.taskassignments.every(a => a.completedat) ? 'Completed' : 
     task.taskassignments.some(a => a.completedat) ? 'In Progress' : 'Assigned') : 
    'Not Assigned';

  return (
    <Card className={`border-l-4 ${
      isOverdue ? 'border-l-destructive' : 
      task.status === 'Completed' ? 'border-l-green-500' :
      task.status === 'In Progress' ? 'border-l-yellow-500' :
      'border-l-muted'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="font-medium mb-2">{task.taskdescription}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={task.status} />
              <StatusBadge status={assignmentStatus} />
              {isOverdue && <StatusBadge status="Overdue" />}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {task.duedate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Due: {new Date(task.duedate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created: {new Date(task.createdat).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {task.taskassignments.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-3 w-3" />
              <span className="text-xs font-medium">Assigned Team</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.taskassignments.map((assignment: TaskAssignment) => (
                <Badge 
                  key={assignment.taskassignmentid} 
                  variant={assignment.completedat ? "default" : "outline"}
                  className="text-xs"
                >
                  <div className="flex items-center gap-1">
                    {assignment.completedat ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {assignment.users.name}
                  </div>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Phase Section Component for Actual Project Phases
const ProjectPhaseSection = ({ phase }: { phase: Phase }) => {
  const phaseProgress = calculatePhaseProgress(phase);
  
  const currentProgress = phaseProgress;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <Workflow className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{phase.phasename}</CardTitle>
              <CardDescription className="flex items-center gap-3 mt-1">
                <span>Phase {phase.phaseorder}</span>
                <span>•</span>
                <span>{currentProgress.completed} of {currentProgress.total} tasks completed</span>
                <StatusBadge status={currentProgress.status} />
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{currentProgress.percentage}%</div>
            <Progress value={currentProgress.percentage} className="w-24 h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {currentProgress.completed}/{currentProgress.total} tasks
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {phase.tasks.map((task: Task) => (
            <TaskCard key={task.taskid} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Template Section Component with Actual Project Progress
const TemplateSection = ({ template }: { template: Template }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Real-time progress calculation
  const [templateProgress, setTemplateProgress] = useState(calculateTemplateProgress(template));
  
  useEffect(() => {
    setTemplateProgress(calculateTemplateProgress(template));
  }, [template]);

  return (
    <Card className="overflow-hidden mb-6">
      <CardHeader 
        className="cursor-pointer pb-4 hover:bg-muted/50 transition-colors border-b"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {isExpanded ? <FolderOpen className="h-5 w-5 text-primary" /> : <FolderClosed className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl">{template.templatename}</CardTitle>
                <TemplateBadge category={template.category} />
              </div>
              <CardDescription className="text-base">{template.description}</CardDescription>
              
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <ProgressDisplay 
                    value={templateProgress.percentage} 
                    label="Overall Progress" 
                    sublabel={`${templateProgress.completedTasks}/${templateProgress.totalTasks} tasks`}
                    icon={BarChart3}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Phases Completed</span>
                    <span className="font-bold">{templateProgress.completedPhases}/{templateProgress.totalPhases}</span>
                  </div>
                  <Progress 
                    value={templateProgress.totalPhases > 0 ? Math.round((templateProgress.completedPhases / templateProgress.totalPhases) * 100) : 0} 
                    className="h-2" 
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Task Completion</span>
                    <span className="font-bold">{templateProgress.completedTasks}/{templateProgress.totalTasks}</span>
                  </div>
                  <Progress value={templateProgress.percentage} className="h-2" />
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-6 space-y-6">
          {/* Template Plan (Original Template Structure) */}
          <div>
            <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Template Plan
            </h4>
            <Accordion type="single" collapsible className="space-y-2">
              {template.templatephases
                .sort((a: TemplatePhase, b: TemplatePhase) => a.phaseorder - b.phaseorder)
                .map((phase: TemplatePhase) => (
                  <AccordionItem key={phase.templatephaseid} value={phase.templatephaseid.toString()} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                            Phase {phase.phaseorder}
                          </span>
                          <span className="font-medium">{phase.phasename}</span>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {phase.templatetasks.length} planned tasks
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-2">
                        {phase.templatetasks.map((task: TemplateTask, index: number) => (
                          <div key={task.templatetaskid} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="text-sm">{task.taskdescription}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>

          {/* Actual Project Progress */}
          <div>
            <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Project Progress ({templateProgress.percentage}% Complete)
            </h4>
            {template.phases.length > 0 ? (
              <div className="space-y-4">
                {template.phases
                  .sort((a: Phase, b: Phase) => a.phaseorder - b.phaseorder)
                  .map((phase: Phase) => (
                    <ProjectPhaseSection key={phase.phaseid} phase={phase} />
                  ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No progress yet. Work will appear here once started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Statistics Cards Component
const StatisticsCards = ({ statistics }: { statistics: ProjectStatistics }) => {
  const stats = [
    {
      label: "Phases Completed",
      value: `${statistics.completedPhases}/${statistics.totalPhases}`,
      percentage: statistics.completionPercentage,
      icon: BarChart3,
      color: "text-blue-600",
      description: "Phases where all tasks are completed"
    },
    {
      label: "Tasks Completed",
      value: `${statistics.completedTasks}/${statistics.totalTasks}`,
      percentage: statistics.taskCompletionPercentage,
      icon: CheckCircle,
      color: "text-green-600",
      description: "Individual tasks marked as completed"
    },
    {
      label: "Assignments Done",
      value: `${statistics.completedAssignments}/${statistics.totalAssignments}`,
      percentage: statistics.assignmentCompletionPercentage,
      icon: Users,
      color: "text-purple-600",
      description: "Task assignments completed by team"
    },
    {
      label: "Overdue Tasks",
      value: statistics.overdueTasks.toString(),
      percentage: 0,
      icon: AlertCircle,
      color: "text-red-600",
      description: "Tasks past due date not completed"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                )}
                {stat.percentage > 0 && (
                  <Progress value={stat.percentage} className="mt-2 w-full" />
                )}
              </div>
              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function VClientPage(): JSX.Element {
  const [projectId, setProjectId] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProjectDetails = async (): Promise<void> => {
    if (!projectId.trim()) {
      setError('Please enter a Project ID');
      return;
    }

    setError('');
    setProject(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/pro/${projectId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch project');
      }
      
      const data: ApiResponse = await response.json();
      setProject(data.project);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchProjectDetails();
  };

  // Calculate real-time statistics
  const realTimeStatistics = project ? calculateProjectStatistics(project.templates) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border mb-4">
            <Target className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Project Progress Hub
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time progress tracking based on task completion. Progress updates automatically every 30 seconds.
          </p>
        </div>

        {/* Project ID Input Form */}
        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <Label htmlFor="projectId" className="text-base font-medium">
                  Project Identifier
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Enter your Project ID (e.g., PRJ-001)"
                    className="pl-10 py-3 text-lg border-2 focus:border-primary transition-colors"
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="py-3 px-8 text-lg font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    View Progress
                  </>
                )}
              </Button>
            </form>
            {lastUpdated && (
              <div className="text-xs text-muted-foreground mt-2 text-right">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div>
                <h3 className="text-xl font-semibold">Loading Project Details</h3>
                <p className="text-muted-foreground">Fetching real-time progress updates...</p>
              </div>
            </div>
          </div>
        )}

        {/* Project Details Display */}
        {project && !isLoading && realTimeStatistics && (
          <div className="space-y-8">
            {/* Project Header */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <Building className="h-8 w-8" />
                      <div>
                        <h2 className="text-3xl font-bold">{project.projectname}</h2>
                        <div className="flex items-center gap-3 mt-2">
                          <StatusBadge status={project.status} />
                          <span className="text-blue-100">{project.projecttype}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      {project.description || 'Comprehensive project tracking and management'}
                    </p>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="text-4xl font-bold mb-2">{realTimeStatistics.completionPercentage}%</div>
                    <div className="text-blue-200 font-medium">Overall Completion</div>
                    <Progress value={realTimeStatistics.completionPercentage} className="mt-2 w-32 bg-blue-500" />
                    <div className="text-blue-200 text-sm mt-1">
                      {realTimeStatistics.completedPhases}/{realTimeStatistics.totalPhases} phases complete
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <StatisticsCards statistics={realTimeStatistics} />

            {/* Templates Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6" />
                  Template Progress (Task-Based)
                </CardTitle>
                <CardDescription className="text-lg">
                  Progress calculated based on completed tasks. A phase is complete only when all its tasks are completed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.templates.length > 0 ? (
                  project.templates.map((template: Template) => (
                    <TemplateSection key={template.templateid} template={template} />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Templates Assigned</h3>
                    <p>Project templates will appear here once they are assigned to this project.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Project Team
                </CardTitle>
                <CardDescription>
                  {project.team.length} team member{project.team.length !== 1 ? 's' : ''} working on this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.team.map((member: TeamMember) => (
                    <Card key={member.projectteamid} className="text-center">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                          {member.user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h4 className="font-semibold">{member.user.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{member.user.email}</p>
                        <Badge variant="secondary">{member.role}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          Joined {new Date(member.addedat).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!project && !isLoading && (
          <Card className="text-center py-16 shadow-lg border-0">
            <CardContent>
              <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">Enter Project ID</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Enter your Project ID above to access real-time progress tracking based on task completion.
              </p>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Real-time Updates
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Task-Based Progress
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}