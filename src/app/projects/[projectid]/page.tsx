'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface User {
  userid: number;
  name: string;
  email: string;
  role: string;
  createdat: string;
  linkedin_profile: string | null;
  instagram_profile: string | null;
  phone_number: string | null;
  country: string | null;
  company_email: string | null;
}

interface TaskAssignment {
  taskassignmentid: number;
  userid: number;
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
  templateid: number;
  taskassignments: TaskAssignment[];
}

interface Phase {
  phaseid: number;
  phasename: string;
  phaseorder: number;
  status: string;
  createdat: string;
  templateid: number;
  tasks: Task[];
}

interface ProjectTemplate {
  projecttemplateid: number;
  templateid: number;
  templates: {
    templatename: string;
    category: string;
  };
}

interface Project {
  projectid: number;
  projectname: string;
  description: string;
  projecttype: string;
  createdat: string;
  phases: Phase[];
  projecttemplates: ProjectTemplate[];
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectid as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseTemplate, setNewPhaseTemplate] = useState<number | null>(null);
  const [showAddTask, setShowAddTask] = useState<number | null>(null);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTask, setEditingTask] = useState<{ taskId: number; description: string } | null>(null);
  const [editingPhase, setEditingPhase] = useState<{ phaseId: number; name: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [assigningTask, setAssigningTask] = useState<number | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>('all');

  useEffect(() => {
    fetchProject();
    fetchUsers();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      if (data.message === 'No projects yet') {
        setProject(null);
      } else {
        setProject(data.project);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Helper function to find phase by task ID
  const findPhaseByTaskId = (taskId: number) => {
    return project?.phases.find(p => p.tasks.some(t => t.taskid === taskId));
  };

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/projects/${projectId}/phases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phasename: newPhaseName,
          templateid: newPhaseTemplate
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add phase');
      }
      setNewPhaseName('');
      setNewPhaseTemplate(null);
      setShowAddPhase(false);
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add phase');
    }
  };

  const handleAddTask = async (phaseId: number, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/projects/${projectId}/phases/${phaseId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskdescription: newTaskDescription,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      setNewTaskDescription('');
      setShowAddTask(null);
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const phase = findPhaseByTaskId(taskId);
      if (!phase) throw new Error('Phase not found for this task');

      const response = await fetch(`/api/projects/${projectId}/phases/${phase.phaseid}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  const handleUpdateTask = async (taskId: number, description: string) => {
    try {
      const phase = findPhaseByTaskId(taskId);
      if (!phase) throw new Error('Phase not found for this task');

      const response = await fetch(`/api/projects/${projectId}/phases/${phase.phaseid}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskdescription: description,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      setEditingTask(null);
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const phase = findPhaseByTaskId(taskId);
      if (!phase) throw new Error('Phase not found for this task');

      const response = await fetch(`/api/projects/${projectId}/phases/${phase.phaseid}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleUpdatePhase = async (phaseId: number, name: string, status: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/phases/${phaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phasename: name,
          status: status,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update phase');
      }
      setEditingPhase(null);
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update phase');
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/phases/${phaseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete phase');
      }
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete phase');
    }
  };

  const handleAssignTask = async (taskId: number, userId: number) => {
    try {
      const phase = findPhaseByTaskId(taskId);
      if (!phase) throw new Error('Phase not found for this task');

      const response = await fetch(`/api/projects/${projectId}/phases/${phase.phaseid}/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign task');
      }
      
      setAssigningTask(null);
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
    }
  };

  const handleUnassignTask = async (taskId: number, userId: number) => {
    try {
      const phase = findPhaseByTaskId(taskId);
      if (!phase) throw new Error('Phase not found for this task');

      const response = await fetch(`/api/projects/${projectId}/phases/${phase.phaseid}/tasks/${taskId}/assign?userid=${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to unassign task');
      }
      
      fetchProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unassign task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTemplateColor = (category: string) => {
    switch (category) {
      case 'SEO':
        return 'border-blue-500 bg-blue-50';
      case 'Email Marketing':
        return 'border-green-500 bg-green-50';
      case 'Social Media':
        return 'border-purple-500 bg-purple-50';
      case 'Automation':
        return 'border-orange-500 bg-orange-50';
      case 'Graphic Design':
        return 'border-pink-500 bg-pink-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getTemplateTextColor = (category: string) => {
    switch (category) {
      case 'SEO':
        return 'text-blue-700';
      case 'Email Marketing':
        return 'text-green-700';
      case 'Social Media':
        return 'text-purple-700';
      case 'Automation':
        return 'text-orange-700';
      case 'Graphic Design':
        return 'text-pink-700';
      default:
        return 'text-gray-700';
    }
  };

  // Filter phases by template
  const filteredPhases = project?.phases.filter(phase => {
    if (activeTemplate === 'all') return true;
    
    const template = project.projecttemplates.find(pt => pt.templateid === phase.templateid);
    return template?.templates.category === activeTemplate;
  }) || [];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchProject} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">
            Try Again
          </button>
        </div>
      </div>
    );

  if (!project)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">No Project Found</div>
          <button onClick={() => router.push('/')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">
            Back to Projects
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800 font-medium">
            &larr; Back to Projects
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.projectname}</h1>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('Not Started')}`}>
                  {project.projecttype}
                </span>
                <span className="text-sm text-gray-500">
                  Created: {new Date(project.createdat).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Templates Overview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Included Templates</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {project.projecttemplates?.map((pt) => (
                <div key={pt.projecttemplateid} className={`p-3 border-l-4 rounded ${getTemplateColor(pt.templates.category)}`}>
                  <div className={`font-medium text-sm ${getTemplateTextColor(pt.templates.category)}`}>
                    {pt.templates.category}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{pt.templates.templatename}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Project Phases</h2>
            <button
              onClick={() => setShowAddPhase(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Add Phase
            </button>
          </div>

          {/* Template Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Filter by Template:</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTemplate('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTemplate === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                All Templates
              </button>
              {project.projecttemplates?.map((pt) => (
                <button
                  key={pt.templateid}
                  onClick={() => setActiveTemplate(pt.templates.category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeTemplate === pt.templates.category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {pt.templates.category}
                </button>
              ))}
            </div>
          </div>

          {showAddPhase && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Add New Phase</h3>
              <form onSubmit={handleAddPhase}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Phase Name</label>
                  <input
                    type="text"
                    required
                    value={newPhaseName}
                    onChange={(e) => setNewPhaseName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter phase name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Template</label>
                  <select
                    value={newPhaseTemplate || ''}
                    onChange={(e) => setNewPhaseTemplate(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Template</option>
                    {project.projecttemplates?.map((pt) => (
                      <option key={pt.templateid} value={pt.templateid}>
                        {pt.templates.category} - {pt.templates.templatename}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    Add Phase
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPhase(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {filteredPhases.length > 0 ? (
              filteredPhases.map((phase) => {
                const phaseTemplate = project.projecttemplates.find(pt => pt.templateid === phase.templateid);
                const templateCategory = phaseTemplate?.templates.category || 'Unknown';
                
                return (
                  <div key={phase.phaseid} className={`border-l-4 rounded-lg p-4 ${getTemplateColor(templateCategory)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getTemplateTextColor(templateCategory)} ${getTemplateColor(templateCategory).replace('bg-', 'bg-').replace('50', '100')}`}>
                            {templateCategory}
                          </span>
                          {editingPhase?.phaseId === phase.phaseid ? (
                            <input
                              type="text"
                              value={editingPhase.name}
                              onChange={(e) => setEditingPhase({ ...editingPhase, name: e.target.value })}
                              className="flex-1 p-2 border border-gray-300 rounded-md text-lg font-semibold"
                            />
                          ) : (
                            <h3 className="text-lg font-semibold">{phase.phasename}</h3>
                          )}
                        </div>
                        {editingPhase?.phaseId !== phase.phaseid && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                            {phase.status}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingPhase?.phaseId === phase.phaseid ? (
                          <>
                            <button
                              onClick={() => handleUpdatePhase(phase.phaseid, editingPhase.name, phase.status)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Save
                            </button>
                            <button onClick={() => setEditingPhase(null)} className="text-gray-600 hover:text-gray-800">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingPhase({ phaseId: phase.phaseid, name: phase.phasename })}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePhase(phase.phaseid)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">Tasks</h4>
                        <button
                          onClick={() => setShowAddTask(phase.phaseid)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Add Task
                        </button>
                      </div>
                      {showAddTask === phase.phaseid && (
                        <div className="mb-4 p-3 bg-white rounded-lg border">
                          <form onSubmit={(e) => handleAddTask(phase.phaseid, e)}>
                            <div className="mb-2">
                              <label className="block text-sm font-medium mb-1">Task Description</label>
                              <input
                                type="text"
                                required
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter task description"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                                Add Task
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddTask(null)}
                                className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                      <div className="space-y-2">
                        {phase.tasks && phase.tasks.length > 0 ? (
                          phase.tasks.map((task) => (
                            <div key={task.taskid} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                              <div className="flex-1">
                                {editingTask?.taskId === task.taskid ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editingTask.description}
                                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                      className="flex-1 p-1 border border-gray-300 rounded-md"
                                    />
                                    <button
                                      onClick={() => handleUpdateTask(task.taskid, editingTask.description)}
                                      className="text-green-600 hover:text-green-800 text-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingTask(null)}
                                      className="text-gray-600 hover:text-gray-800 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={task.status === 'Completed'}
                                      onChange={(e) =>
                                        handleUpdateTaskStatus(task.taskid, e.target.checked ? 'Completed' : 'Not Started')
                                      }
                                      className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <span className={task.status === 'Completed' ? 'line-through text-gray-500' : ''}>
                                      {task.taskdescription}
                                    </span>
                                  </div>
                                )}
                                {task.taskassignments && task.taskassignments.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Assigned to: {task.taskassignments.map((a) => a.users.name).join(', ')}
                                    {task.taskassignments.map((assignment) => (
                                      <button
                                        key={assignment.taskassignmentid}
                                        onClick={() => handleUnassignTask(task.taskid, assignment.userid)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                        title="Unassign"
                                      >
                                        ×
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={task.status}
                                  onChange={(e) => handleUpdateTaskStatus(task.taskid, e.target.value)}
                                  className="text-xs p-1 border border-gray-300 rounded-md"
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                                
                                {assigningTask === task.taskid ? (
                                  <select
                                    onChange={(e) => {
                                      const userId = parseInt(e.target.value);
                                      if (userId) {
                                        handleAssignTask(task.taskid, userId);
                                      }
                                      setAssigningTask(null);
                                    }}
                                    onBlur={() => setAssigningTask(null)}
                                    autoFocus
                                    className="text-xs p-1 border border-gray-300 rounded-md"
                                  >
                                    <option value="">Select user</option>
                                    {users.map((user) => (
                                      <option key={user.userid} value={user.userid}>
                                        {user.name} ({user.role})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <button
                                    onClick={() => setAssigningTask(task.taskid)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                    title="Assign Task"
                                  >
                                    👤
                                  </button>
                                )}
                                
                                {editingTask?.taskId !== task.taskid && (
                                  <>
                                    <button
                                      onClick={() => setEditingTask({ taskId: task.taskid, description: task.taskdescription })}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.taskid)}
                                      className="text-xs text-red-600 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No tasks yet. Add a task to get started.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No phases found for the selected template.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}