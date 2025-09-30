'use client';

import { useState, useEffect } from 'react';
import ProjectForm from './ProjectForm';
import PhaseForm from './PhaseForm';
import TaskForm from './TaskForm';

interface SEOTask {
  id: string;
  phase_id: string;
  project_id: string;
  name: string;
  description?: string;
  assigned_to: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  due_date?: string;
  priority: 'Low' | 'Medium' | 'High';
  order_index: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

interface SEOPhase {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  order_index: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
  tasks: SEOTask[];
}

interface SEOProject {
  id: string;
  name: string;
  client_name: string;
  website_url?: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  start_date?: string;
  target_completion_date?: string;
  created_at: string;
  updated_at: string;
  phases: SEOPhase[];
}

interface ProjectManagerProps {
  onProjectSelect: (project: SEOProject) => void;
  onProjectUpdate: () => void;
}

export default function ProjectManager({ onProjectSelect, onProjectUpdate }: ProjectManagerProps) {
  const [projects, setProjects] = useState<SEOProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SEOProject | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingProject, setEditingProject] = useState<SEOProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/seo-projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const response = await fetch(`/api/seo-projects/${projectId}`);
      const data = await response.json();
      setSelectedProject(data);
      onProjectSelect(data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const handleProjectSelect = (project: SEOProject) => {
    setSelectedProject(project);
    fetchProjectDetails(project.id);
  };

  const handleProjectCreate = async (projectData: Partial<SEOProject>) => {
    try {
      const response = await fetch('/api/seo-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        setShowProjectForm(false);
        fetchProjects();
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectUpdate = async (projectData: Partial<SEOProject>) => {
    if (!editingProject) return;

    try {
      const response = await fetch(`/api/seo-projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        setEditingProject(null);
        fetchProjects();
        if (selectedProject?.id === editingProject.id) {
          fetchProjectDetails(editingProject.id);
        }
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project and all its phases and tasks?')) {
      return;
    }

    try {
      const response = await fetch(`/api/seo-projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
          onProjectSelect(null as any);
        }
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handlePhaseCreate = async (phaseData: Partial<SEOPhase>) => {
    if (!selectedProject) return;

    try {
      const response = await fetch('/api/seo-phases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...phaseData,
          project_id: selectedProject.id,
        }),
      });

      if (response.ok) {
        setShowPhaseForm(false);
        fetchProjectDetails(selectedProject.id);
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error creating phase:', error);
    }
  };

  const handleTaskCreate = async (taskData: Partial<SEOTask>) => {
    if (!selectedProject) return;

    try {
      const response = await fetch('/api/seo-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          project_id: selectedProject.id,
        }),
      });

      if (response.ok) {
        setShowTaskForm(false);
        fetchProjectDetails(selectedProject.id);
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

const generatePDF = async () => {
  if (!selectedProject) return;
  
  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedProject),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${selectedProject.name.replace(/\s+/g, '_')}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // Get the error message from the response
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to generate PDF:', response.status, response.statusText, errorData);
      
      // Show user-friendly error message
      alert(`Failed to generate PDF: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please check the console for details.');
  }
};
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">SEO Projects</h2>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowProjectForm(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Project</h3>
          <div className="space-y-2">
            {projects.map(project => (
              <div
                key={project.id}
                className={`p-3 border rounded-md cursor-pointer ${
                  selectedProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleProjectSelect(project)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.client_name}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'On Hold' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setShowProjectForm(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectDelete(project.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Actions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Actions</h3>
          {selectedProject ? (
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">{selectedProject.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{selectedProject.description}</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPhaseForm(true)}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Add New Phase
                  </button>
                  
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                  >
                    Add New Task
                  </button>

                  <button
                    onClick={generatePDF}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Export to PDF
                  </button>
                </div>
              </div>

              {selectedProject.phases && selectedProject.phases.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Phases</h4>
                  <div className="space-y-2">
                    {selectedProject.phases.map(phase => (
                      <div key={phase.id} className="p-3 border border-gray-200 rounded-md">
                        <h5 className="font-medium text-gray-900">{phase.name}</h5>
                        <p className="text-sm text-gray-600">{phase.tasks?.length || 0} tasks</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a project to manage phases and tasks
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? handleProjectUpdate : handleProjectCreate}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {showPhaseForm && selectedProject && (
        <PhaseForm
          projectId={selectedProject.id}
          onSubmit={handlePhaseCreate}
          onClose={() => setShowPhaseForm(false)}
        />
      )}

      {showTaskForm && selectedProject && (
        <TaskForm
          projectId={selectedProject.id}
          phases={selectedProject.phases || []}
          onSubmit={handleTaskCreate}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}