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
  BarChart3,
  Workflow,
  FolderOpen,
  FolderClosed,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Award,
  Eye,
  Download,
  Share2,
  RefreshCw,
  Star,
  Rocket,
  Lightbulb,
  Globe,
  Key,
  Lock,
  AlertTriangle
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
  requiresAuth?: boolean;
  authError?: string;
}

interface Client {
  id: string;
  email: string;
  name: string;
  company: string;
  phone?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
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
      'Development': 'secondary',
      'Design': 'outline',
      'Marketing': 'default',
    };
    
    return variants[category] || 'outline';
  };

  return (
    <Badge variant={getVariant(category)} className="flex items-center gap-1">
      <Sparkles className="h-3 w-3" />
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
    <Card className={`border-l-4 transition-all duration-300 hover:shadow-md ${
      isOverdue ? 'border-l-destructive bg-red-50/50' : 
      task.status === 'Completed' ? 'border-l-green-500 bg-green-50/50' :
      task.status === 'In Progress' ? 'border-l-yellow-500 bg-yellow-50/50' :
      'border-l-muted bg-blue-50/50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="font-medium mb-2 text-gray-900">{task.taskdescription}</p>
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
    <Card className="mb-4 transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <Workflow className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">{phase.phasename}</CardTitle>
              <CardDescription className="flex items-center gap-3 mt-1">
                <span>Phase {phase.phaseorder}</span>
                <span>•</span>
                <span>{currentProgress.completed} of {currentProgress.total} tasks completed</span>
                <StatusBadge status={currentProgress.status} />
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentProgress.percentage}%
            </div>
            <Progress value={currentProgress.percentage} className="w-24 h-2 bg-blue-100" />
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
    <Card className="overflow-hidden mb-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader 
        className="cursor-pointer pb-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 border-b"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm">
              {isExpanded ? <FolderOpen className="h-5 w-5 text-white" /> : <FolderClosed className="h-5 w-5 text-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl text-gray-900">{template.templatename}</CardTitle>
                <TemplateBadge category={template.category} />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>Template</span>
                </div>
              </div>
              <CardDescription className="text-base">{template.description}</CardDescription>
              
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <ProgressDisplay 
                    value={templateProgress.percentage} 
                    label="Overall Progress" 
                    sublabel={`${templateProgress.completedTasks}/${templateProgress.totalTasks} tasks`}
                    icon={TrendingUp}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Phases Completed</span>
                    <span className="font-bold">{templateProgress.completedPhases}/{templateProgress.totalPhases}</span>
                  </div>
                  <Progress 
                    value={templateProgress.totalPhases > 0 ? Math.round((templateProgress.completedPhases / templateProgress.totalPhases) * 100) : 0} 
                    className="h-2 bg-blue-100" 
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Task Completion</span>
                    <span className="font-bold">{templateProgress.completedTasks}/{templateProgress.totalTasks}</span>
                  </div>
                  <Progress value={templateProgress.percentage} className="h-2 bg-green-100" />
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white shadow-sm border">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-6 space-y-6 bg-gradient-to-br from-gray-50/30 to-blue-50/20">
          {/* Template Plan (Original Template Structure) */}
          <div>
            <h4 className="font-semibold mb-3 text-lg flex items-center gap-2 text-gray-900">
              <FileText className="h-4 w-4 text-blue-600" />
              Template Plan
            </h4>
            <Accordion type="single" collapsible className="space-y-2">
              {template.templatephases
                .sort((a: TemplatePhase, b: TemplatePhase) => a.phaseorder - b.phaseorder)
                .map((phase: TemplatePhase) => (
                  <AccordionItem key={phase.templatephaseid} value={phase.templatephaseid.toString()} className="border rounded-lg bg-white/50 backdrop-blur-sm">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded">
                            Phase {phase.phaseorder}
                          </span>
                          <span className="font-medium text-gray-900">{phase.phasename}</span>
                        </div>
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                          {phase.templatetasks.length} planned tasks
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-2">
                        {phase.templatetasks.map((task: TemplateTask, index: number) => (
                          <div key={task.templatetaskid} className="flex items-center gap-3 p-2 rounded-md bg-white border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium shadow-sm">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{task.taskdescription}</span>
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
            <h4 className="font-semibold mb-3 text-lg flex items-center gap-2 text-gray-900">
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
              <Card className="text-center py-8 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border-0 shadow-sm">
                <CardContent>
                  <Clock className="h-12 w-12 mx-auto mb-3 text-yellow-600 opacity-70" />
                  <p className="text-muted-foreground font-medium">No progress yet. Work will appear here once started.</p>
                  <p className="text-sm text-muted-foreground mt-1">Tasks and progress will be displayed as the team begins work.</p>
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
      bgColor: "bg-blue-500",
      description: "Phases where all tasks are completed"
    },
    {
      label: "Tasks Completed",
      value: `${statistics.completedTasks}/${statistics.totalTasks}`,
      percentage: statistics.taskCompletionPercentage,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-500",
      description: "Individual tasks marked as completed"
    },
    {
      label: "Assignments Done",
      value: `${statistics.completedAssignments}/${statistics.totalAssignments}`,
      percentage: statistics.assignmentCompletionPercentage,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-500",
      description: "Task assignments completed by team"
    },
    {
      label: "Overdue Tasks",
      value: statistics.overdueTasks.toString(),
      percentage: 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-500",
      description: "Tasks past due date not completed"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                )}
                {stat.percentage > 0 && (
                  <Progress value={stat.percentage} className="mt-2 w-full bg-gray-200" />
                )}
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.bgColor} to-${stat.bgColor.replace('500', '600')} shadow-sm`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Feature Highlights Component
const FeatureHighlights = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-purple-50/50">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Real-time Updates</h3>
        <p className="text-sm text-muted-foreground">Live progress tracking with automatic updates every 30 seconds</p>
      </CardContent>
    </Card>
    
    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50/50 to-emerald-50/50">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Task-Based Progress</h3>
        <p className="text-sm text-muted-foreground">Accurate progress calculation based on individual task completion</p>
      </CardContent>
    </Card>
    
    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50/50 to-red-50/50">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Team Collaboration</h3>
        <p className="text-sm text-muted-foreground">Track team assignments and individual contributions</p>
      </CardContent>
    </Card>
  </div>
);

// Authentication Alert Component
const AuthenticationAlert = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
    <Card className="w-full max-w-md border-0 shadow-2xl bg-gradient-to-br from-white/90 to-red-50/50 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <AlertTriangle className="h-10 w-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Authentication Required
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          You need to be logged in to access this page. Please sign in to view project progress and analytics.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl"
            size="lg"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Go to Login
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full py-3 text-base rounded-xl border-2"
          >
            Back to Home
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Shield className="h-4 w-4" />
            <span>Secure access required for project data protection</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function VClientPage(): JSX.Element {
  const [projectId, setProjectId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [requiresAuth, setRequiresAuth] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (response.ok && data.client) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const fetchProjectDetails = async (): Promise<void> => {
    if (!projectId.trim()) {
      setError('Please enter a Project ID');
      return;
    }

    setError('');
    setProject(null);
    setRequiresAuth(false);
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (password) params.append('password', password);
      if (token) params.append('token', token);

      const url = `/api/pro/${projectId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requiresAuth) {
          setRequiresAuth(true);
          setError('This project requires authentication. Please enter password and/or token.');
          return;
        }
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

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Checking Authentication</h3>
            <p className="text-muted-foreground text-lg">Verifying your access permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication alert if not logged in
  if (!isAuthenticated) {
    return <AuthenticationAlert />;
  }

  // Show main content if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-xl border border-white/20 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Project Progress Hub
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Track your project&apos;s real-time progress with beautiful visualizations and detailed task-based analytics
          </p>
        </div>

        {/* Feature Highlights */}
        <FeatureHighlights />

        {/* Project ID Input Form */}
        <Card className="mb-8 shadow-2xl border-0 bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Enter Project Details
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project ID Input */}
              <div className="space-y-3">
                <Label htmlFor="projectId" className="text-lg font-semibold text-gray-900">
                  Project Identifier *
                </Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Enter your Project ID (e.g., PRJ-001, PROJ-2024)"
                    className="pl-12 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Authentication Fields - Only show if required or user wants to provide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Project Password (Optional)
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter project password if required"
                      className="pl-12 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="token" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Access Token (Optional)
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter access token if required"
                      className="pl-12 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className={`flex items-center gap-2 text-sm p-4 rounded-lg border ${
                  requiresAuth 
                    ? 'bg-yellow-50/50 border-yellow-200 text-yellow-800' 
                    : 'bg-red-50/50 border-red-200 text-red-800'
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  {error}
                  {requiresAuth && (
                    <span className="text-xs ml-2">(Authentication Required)</span>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="py-4 px-10 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl flex-1 sm:flex-none"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-5 w-5 mr-2" />
                      View Progress
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Public Access - Authentication Optional</span>
                </div>
              </div>
            </form>
            
            {lastUpdated && (
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                <span>Project ID: {projectId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center py-20 space-y-6">
            <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <div className="text-left">
                <h3 className="text-2xl font-semibold text-gray-900">Loading Project Details</h3>
                <p className="text-muted-foreground text-lg">Fetching real-time progress updates and analytics...</p>
              </div>
            </div>
          </div>
        )}

        {/* Project Details Display */}
        {project && !isLoading && realTimeStatistics && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Project Header */}
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
              <CardContent className="p-8 relative">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Building className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold mb-2">{project.projectname}</h2>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={project.status} />
                          <span className="text-blue-100 font-medium text-lg">{project.projecttype}</span>
                          <div className="flex items-center gap-1 text-blue-100">
                            <Award className="h-4 w-4" />
                            <span>Active Project</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-blue-100 text-xl leading-relaxed max-w-3xl">
                      {project.description || 'Comprehensive project tracking and management with real-time progress monitoring'}
                    </p>
                  </div>
                  <div className="text-center lg:text-right bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      {realTimeStatistics.completionPercentage}%
                    </div>
                    <div className="text-blue-200 font-medium text-lg">Overall Completion</div>
                    <Progress value={realTimeStatistics.completionPercentage} className="mt-3 w-40 bg-blue-500/30 h-3 rounded-full" />
                    <div className="text-blue-200 text-sm mt-2">
                      {realTimeStatistics.completedPhases}/{realTimeStatistics.totalPhases} phases complete
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" className="rounded-xl border-2 py-3 px-6">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="rounded-xl border-2 py-3 px-6">
                <Share2 className="h-4 w-4 mr-2" />
                Share Progress
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl border-2 py-3 px-6"
                onClick={fetchProjectDetails}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>

            {/* Statistics */}
            <StatisticsCards statistics={realTimeStatistics} />

            {/* Templates Section */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-3xl">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Template Progress
                  </span>
                </CardTitle>
                <CardDescription className="text-xl">
                  Real-time progress tracking based on task completion. A phase is complete only when all its tasks are finished.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.templates.length > 0 ? (
                  project.templates.map((template: Template) => (
                    <TemplateSection key={template.templateid} template={template} />
                  ))
                ) : (
                  <div className="text-center py-16 text-muted-foreground bg-gradient-to-br from-gray-50/50 to-blue-50/30 rounded-2xl border-2 border-dashed">
                    <FileText className="h-20 w-20 mx-auto mb-6 opacity-30" />
                    <h3 className="text-2xl font-semibold mb-3">No Templates Assigned</h3>
                    <p className="text-lg max-w-md mx-auto">
                      Project templates will appear here once they are assigned to this project.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Section */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Project Team
                  </span>
                </CardTitle>
                <CardDescription className="text-lg">
                  {project.team.length} dedicated team member{project.team.length !== 1 ? 's' : ''} working on this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {project.team.map((member: TeamMember) => (
                    <Card key={member.projectteamid} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                      <CardContent className="p-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">
                          {member.user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-1">{member.user.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3 truncate">{member.user.email}</p>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-sm py-1 px-3">
                          {member.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-3">
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
          <Card className="text-center py-20 shadow-2xl border-0 bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-semibold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Ready to Track Progress?
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                Enter your Project ID above to unlock real-time progress tracking, detailed analytics, and beautiful visualizations of your project&apos;s journey.
              </p>
              <div className="flex justify-center gap-8 text-base text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Real-time Updates
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Team Collaboration
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Detailed Analytics
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
