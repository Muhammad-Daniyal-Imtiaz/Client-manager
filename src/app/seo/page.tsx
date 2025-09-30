'use client'

import React, { useState, useEffect } from 'react';

// Types with lowercase field names
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type TaskAssignment = {
  assignmentid: number;
  taskid: number;
  userid: number;
  users: User;
};

type Task = {
  taskid: number;
  phaseid: number;
  taskdescription: string;
  iscompleted: boolean;
  duedate: string | null;
  createdat: string;
  taskassignments: TaskAssignment[];
};

type Phase = {
  phaseid: number;
  projectid: number;
  phasename: string;
  phaseorder: number;
  tasks: Task[];
};

type ProjectTeam = {
  projectid: number;
  userid: number;
  projectrole: string;
  users: User;
};

type Project = {
  projectid: number;
  projectname: string;
  description: string | null;
  projecttype: string;
  createdbyuserid: number;
  createdat: string;
  phases: Phase[];
  projectteam: ProjectTeam[];
};

type AssignedTask = {
  assignmentid: number;
  taskid: number;
  userid: number;
  tasks: Task & {
    phases: Phase & {
      projects: Project;
    };
  };
  users: User;
};

type UserProject = {
  projectid: number;
  userid: number;
  projectrole: string;
  projects: Project;
};

type NewProjectData = {
  projectname: string;
  description: string;
  projecttype: string;
  templateId?: number;
};

type NewPhaseData = {
  projectid: number;
  phasename: string;
  phaseorder: number;
};

type NewTaskData = {
  phaseid: number;
  taskdescription: string;
  duedate: string | null;
  assignees: number[];
};

type Template = {
  templateid: number;
  templatename: string;
  category: string;
  description: string;
  phases: TemplatePhase[];
};

type TemplatePhase = {
  templatephaseid: number;
  templateid: number;
  phasename: string;
  phaseorder: number;
  tasks: TemplateTask[];
};

type TemplateTask = {
  templatetaskid: number;
  templatephaseid: number;
  taskdescription: string;
};

const TaskManagementSystem = () => {
  // Hardcoded user details
  const user = {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@sitefoundations.com',
    role: 'Owner'
  };

  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assigned' | 'myprojects' | 'create' | 'templates'>('assigned');
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  
  // State for creating new items
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreatePhase, setShowCreatePhase] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [newProject, setNewProject] = useState<NewProjectData>({
    projectname: '',
    description: '',
    projecttype: 'Web Development'
  });
  const [newPhase, setNewPhase] = useState<NewPhaseData>({
    projectid: 0,
    phasename: '',
    phaseorder: 1
  });
  const [newTask, setNewTask] = useState<NewTaskData>({
    phaseid: 0,
    taskdescription: '',
    duedate: null,
    assignees: []
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([
    { id: 1, name: 'Jane Doe', email: 'jane@sitefoundations.com', role: 'Owner' },
    { id: 2, name: 'John Smith', email: 'john@sitefoundations.com', role: 'Developer' },
    { id: 3, name: 'Alice Johnson', email: 'alice@sitefoundations.com', role: 'Designer' },
    { id: 4, name: 'Bob Williams', email: 'bob@sitefoundations.com', role: 'Manager' },
    { id: 5, name: 'Eva Davis', email: 'eva@sitefoundations.com', role: 'QA Tester' }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assigned tasks and user projects
      const tasksResponse = await fetch(`/api/mtasks?userId=${user.id}`);
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await tasksResponse.json();
      
      // Remove duplicate projects
      const uniqueProjects = data.userProjects?.filter((project: UserProject, index: number, self: UserProject[]) => 
        index === self.findIndex((p) => p.projectid === project.projectid)
      ) || [];
      
      setAssignedTasks(data.assignedTasks || []);
      setUserProjects(uniqueProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleTaskStatusChange = async (taskId: number, isCompleted: boolean) => {
    try {
      const response = await fetch('/api/mtasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, isCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingProject) return;
    
    setCreatingProject(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProject,
          createdbyuserid: user.id,
          templateId: selectedTemplate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      setShowCreateProject(false);
      setNewProject({
        projectname: '',
        description: '',
        projecttype: 'Web Development'
      });
      setSelectedTemplate(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/phases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPhase),
      });

      if (!response.ok) {
        throw new Error('Failed to create phase');
      }

      setShowCreatePhase(false);
      setNewPhase({
        projectid: 0,
        phasename: '',
        phaseorder: 1
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create phase');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          createdbyuserid: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      setShowCreateTask(false);
      setNewTask({
        phaseid: 0,
        taskdescription: '',
        duedate: null,
        assignees: []
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    try {
      const response = await fetch(`/api/phases/${phaseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete phase');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete phase');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const getCompletionPercentage = (tasks: Task[] = []) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.iscompleted).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const renderAssignedTasks = () => {
    if (assignedTasks.length === 0) {
      return <div className="text-center text-gray-500 py-8">No tasks assigned to you</div>;
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Tasks Assigned to You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedTasks.map((assignment) => (
            <div key={assignment.assignmentid} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${assignment.tasks.iscompleted ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {assignment.tasks.taskdescription}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 mt-3 space-y-1">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Project: {assignment.tasks.phases.projects.projectname}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Phase: {assignment.tasks.phases.phasename}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {formatDate(assignment.tasks.duedate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignment.tasks.iscompleted}
                      onChange={(e) => handleTaskStatusChange(assignment.tasks.taskid, e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full ${assignment.tasks.iscompleted ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-200`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${assignment.tasks.iscompleted ? 'transform translate-x-6' : ''}`}></div>
                  </label>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {assignment.tasks.iscompleted ? 'Done' : 'To Do'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUserProjects = () => {
    if (userProjects.length === 0) {
      return (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-gray-500">Get started by creating your first project.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateProject(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Project
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Projects</h2>
          <button
            onClick={() => setShowCreateProject(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Project
          </button>
        </div>
        {userProjects.map((userProject) => (
          <div key={userProject.projectid} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div 
              className="flex justify-between items-start cursor-pointer"
              onClick={() => setExpandedProject(expandedProject === userProject.projectid ? null : userProject.projectid)}
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                    {userProject.projects.projectname.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-900">{userProject.projects.projectname}</h2>
                    <p className="text-sm text-gray-500">{userProject.projects.description}</p>
                    <div className="mt-1 flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {userProject.projects.projecttype}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {userProject.projectrole}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {expandedProject === userProject.projectid ? 'Collapse' : 'Expand'}
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${expandedProject === userProject.projectid ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedProject === userProject.projectid && (
              <div className="mt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Phases</h3>
                  <button
                    onClick={() => {
                      setNewPhase({...newPhase, projectid: userProject.projectid});
                      setShowCreatePhase(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Phase
                  </button>
                </div>
                
                {userProject.projects.phases?.map((phase) => {
                  const completion = getCompletionPercentage(phase.tasks);
                  return (
                    <div key={phase.phaseid} className="border-t border-gray-200 pt-5">
                      <div 
                        className="flex justify-between items-center mb-3 cursor-pointer"
                        onClick={() => setExpandedPhase(expandedPhase === phase.phaseid ? null : phase.phaseid)}
                      >
                        <div className="flex items-center">
                          <h3 className="text-md font-medium text-gray-900">{phase.phasename}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this phase?')) {
                                handleDeletePhase(phase.phaseid);
                              }
                            }}
                            className="ml-3 text-red-600 hover:text-red-800 text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                        <div className="flex items-center">
                          <div className="text-sm text-gray-500 mr-3">
                            {completion}% Complete ({phase.tasks?.filter(t => t.iscompleted).length || 0}/{phase.tasks?.length || 0} tasks)
                          </div>
                          <svg 
                            className={`w-5 h-5 text-gray-500 transition-transform ${expandedPhase === phase.phaseid ? 'transform rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                      
                      {expandedPhase === phase.phaseid && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-800">Tasks</h4>
                            <button
                              onClick={() => {
                                setNewTask({...newTask, phaseid: phase.phaseid});
                                setShowCreateTask(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              Add Task
                            </button>
                          </div>
                          {phase.tasks?.map((task) => (
                            <div key={task.taskid} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full mr-3 ${task.iscompleted ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                  <p className="font-medium text-gray-900">{task.taskdescription}</p>
                                </div>
                                <div className="ml-6 text-sm text-gray-600 mt-1">
                                  <p>Due: {formatDate(task.duedate)}</p>
                                  <p className="mt-1">
                                    Assignees: {task.taskassignments?.map(ta => ta.users.name).join(', ') || 'Unassigned'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this task?')) {
                                      handleDeleteTask(task.taskid);
                                    }
                                  }}
                                  className="mr-4 text-red-600 hover:text-red-800 text-sm flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={task.iscompleted}
                                    onChange={(e) => handleTaskStatusChange(task.taskid, e.target.checked)}
                                    className="sr-only"
                                  />
                                  <div className={`w-11 h-6 rounded-full ${task.iscompleted ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-200`}></div>
                                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${task.iscompleted ? 'transform translate-x-5' : ''}`}></div>
                                </label>
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                  {task.iscompleted ? 'Done' : 'To Do'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCreateForms = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Create New Items</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mx-auto">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Create Project</h3>
            <p className="text-sm text-gray-500 mt-2">Start a new project from scratch or using a template</p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              New Project
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mx-auto">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Create Phase</h3>
            <p className="text-sm text-gray-500 mt-2">Add a new phase to an existing project</p>
            <button
              onClick={() => {
                if (userProjects.length === 0) {
                  setError("You need to create a project first");
                  return;
                }
                setNewPhase({
                  ...newPhase,
                  projectid: userProjects[0].projectid
                });
                setShowCreatePhase(true);
              }}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              New Phase
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600 mx-auto">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Create Task</h3>
            <p className="text-sm text-gray-500 mt-2">Add a new task to a phase and assign team members</p>
            <button
              onClick={() => {
                if (userProjects.length === 0 || !userProjects[0].projects.phases?.length) {
                  setError("You need to create a project and phase first");
                  return;
                }
                setNewTask({
                  ...newTask,
                  phaseid: userProjects[0].projects.phases[0].phaseid
                });
                setShowCreateTask(true);
              }}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              New Task
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Template Management</h3>
          <p className="text-sm text-gray-500 mt-2">Create and manage project templates for faster project setup</p>
          <button
            onClick={() => setShowTemplateManager(true)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
            disabled={creatingProject}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Manage Templates
          </button>
        </div>
      </div>
    );
  };

  const renderTemplates = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Project Templates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map(template => (
            <div key={template.templateid} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{template.templatename}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 mb-3">{template.description}</p>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Phases:</p>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  {Array.isArray(template.phases) && template.phases.length > 0 ? (
                    template.phases.map(phase => (
                      <li key={phase.templatephaseid} className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {phase.phasename} ({phase.tasks?.length || 0} tasks)
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No phases available</li>
                  )}
                </ul>
              </div>
              
              <button
                onClick={() => {
                  setSelectedTemplate(template.templateid);
                  setShowCreateProject(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors duration-200 flex items-center justify-center"
                disabled={creatingProject}
              >
                {creatingProject ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Project...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Use This Template
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
        
        {templates.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No templates available</h3>
            <p className="mt-1 text-gray-500">Get started by creating your first template.</p>
            <div className="mt-6">
              <button 
                onClick={() => setShowTemplateManager(true)} 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Create Template
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center">
          <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Error loading data</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Management System</h1>
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs font-medium text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'assigned' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('assigned')}
              >
                <svg className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'assigned' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Assigned to Me
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'myprojects' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('myprojects')}
              >
                <svg className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'myprojects' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                My Projects
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'templates' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('templates')}
              >
                <svg className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'templates' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Templates
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                onClick={() => setActiveTab('create')}
              >
                <svg className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'create' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'assigned' && renderAssignedTasks()}
          {activeTab === 'myprojects' && renderUserProjects()}
          {activeTab === 'templates' && renderTemplates()}
          {activeTab === 'create' && renderCreateForms()}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.projectname}
                    onChange={(e) => setNewProject({...newProject, projectname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter project description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <select
                    value={newProject.projecttype}
                    onChange={(e) => setNewProject({...newProject, projecttype: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Research">Research</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template (Optional)</label>
                  <select
                    value={selectedTemplate || ''}
                    onChange={(e) => setSelectedTemplate(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No Template</option>
                    {templates.map(template => (
                      <option key={template.templateid} value={template.templateid}>
                        {template.templatename} ({template.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateProject(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={creatingProject}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                  disabled={creatingProject}
                >
                  {creatingProject ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Phase Modal */}
      {showCreatePhase && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Phase</h2>
            </div>
            <form onSubmit={handleCreatePhase}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phase Name</label>
                  <input
                    type="text"
                    required
                    value={newPhase.phasename}
                    onChange={(e) => setNewPhase({...newPhase, phasename: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phase name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={newPhase.projectid}
                    onChange={(e) => setNewPhase({...newPhase, projectid: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a project</option>
                    {userProjects.map(project => (
                      <option key={project.projectid} value={project.projectid}>
                        {project.projects.projectname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    min="1"
                    value={newPhase.phaseorder}
                    onChange={(e) => setNewPhase({...newPhase, phaseorder: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreatePhase(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create Phase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                  <input
                    type="text"
                    required
                    value={newTask.taskdescription}
                    onChange={(e) => setNewTask({...newTask, taskdescription: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                  <select
                    value={newTask.phaseid}
                    onChange={(e) => setNewTask({...newTask, phaseid: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a phase</option>
                    {userProjects.flatMap(project => 
                      project.projects.phases?.map(phase => (
                        <option key={phase.phaseid} value={phase.phaseid}>
                          {project.projects.projectname} - {phase.phasename}
                        </option>
                      )) || []
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    onChange={(e) => setNewTask({...newTask, duedate: e.target.value || null})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignees</label>
                  <select
                    multiple
                    value={newTask.assignees.map(a => a.toString())}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setNewTask({...newTask, assignees: selected});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  >
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Template Manager</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Template
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div key={template.templateid} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{template.templatename}</h3>
                    <p className="text-sm text-gray-500">{template.category}</p>
                    <p className="text-sm my-2">{template.description}</p>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Phases:</p>
                      <ul className="text-sm text-gray-600 ml-4 list-disc">
                        {Array.isArray(template.phases) && template.phases.length > 0 ? (
                          template.phases.map(phase => (
                            <li key={phase.templatephaseid}>
                              {phase.phasename} 
                              <ul className="ml-4 list-circle">
                                {Array.isArray(phase.tasks) && phase.tasks.length > 0 ? (
                                  phase.tasks.map(task => (
                                    <li key={task.templatetaskid}>{task.taskdescription}</li>
                                  ))
                                ) : (
                                  <li>No tasks available</li>
                                )}
                              </ul>
                            </li>
                          ))
                        ) : (
                          <li>No phases available</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                        Edit
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end">
              <button
                onClick={() => setShowTemplateManager(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementSystem;