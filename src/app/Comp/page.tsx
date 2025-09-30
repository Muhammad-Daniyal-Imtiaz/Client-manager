'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  projectid: number;
  projectname: string;
  description: string;
  projecttype: string;
  createdat: string;
  projecttemplates: any[];
}

interface TemplatePhase {
  templatephaseid: number;
  phasename: string;
  phaseorder: number;
  templatetasks: TemplateTask[];
}

interface TemplateTask {
  templatetaskid: number;
  taskdescription: string;
}

interface Template {
  templateid: number;
  templatename: string;
  category: string;
  description: string;
  templatephases: TemplatePhase[];
}

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTemplates();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
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
      console.error('Error fetching templates:', err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectname: projectName,
          description,
          projecttype: 'General',
          createdbyuserid: 1,
          useAllTemplates: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setProjectName('');
      setDescription('');
      
      // Close modal after 2 seconds and refresh projects
      setTimeout(() => {
        setShowCreate(false);
        setShowSuccess(false);
        fetchProjects();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setCreating(false);
    }
  };

  const handleProjectClick = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  const toggleTemplateExpand = (templateId: number) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  const getBorderColor = (category: string) => {
    switch (category) {
      case 'SEO':
        return 'border-l-blue-500';
      case 'Email Marketing':
        return 'border-l-green-500';
      case 'Social Media':
        return 'border-l-purple-500';
      case 'Automation':
        return 'border-l-orange-500';
      case 'Graphic Design':
        return 'border-l-pink-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading projects...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-4">Error</div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchProjects}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project Management System
          </h1>
          <p className="text-lg text-gray-600">
            All projects include complete marketing templates for SEO, Email Marketing, Social Media, Automation, and Graphic Design
          </p>
        </div>

        {/* Global Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">All Projects</h2>
              <p className="text-gray-600 mt-1">
                {projects.length} project{projects.length !== 1 ? 's' : ''} created
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                {showTemplates ? 'Hide Templates' : 'View All Templates'}
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Create New Project
              </button>
            </div>
          </div>
        </div>

        {/* Templates Overview */}
        {showTemplates && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Available Templates</h3>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.templateid} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getBorderColor(template.category)} border-l-4`}
                    onClick={() => toggleTemplateExpand(template.templateid)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {template.category}
                        </span>
                        <h4 className="font-semibold text-lg">{template.templatename}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {template.templatephases?.length || 0} phases
                        </span>
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedTemplate === template.templateid ? 'rotate-180' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{template.description}</p>
                  </div>
                  
                  {expandedTemplate === template.templateid && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-4">
                        <div className="space-y-4">
                          {template.templatephases?.map((phase) => (
                            <div key={phase.templatephaseid} className="bg-white rounded-lg border border-gray-200 p-4">
                              <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="text-blue-600">Phase {phase.phaseorder}</span>
                                <span className="text-gray-700">{phase.phasename}</span>
                              </h5>
                              <div className="space-y-2">
                                {phase.templatetasks?.map((task) => (
                                  <div key={task.templatetaskid} className="flex items-start gap-2 text-sm">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    <span className="text-gray-600">{task.taskdescription}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
              
              {showSuccess ? (
                <div className="text-center py-8">
                  <div className="text-green-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Project Created Successfully!</h4>
                  <p className="text-gray-600">Your project has been created with all 5 templates.</p>
                  <div className="mt-4 animate-pulse text-blue-600">
                    Closing automatically...
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-700 text-sm font-medium">
                      💡 This project will include all 5 marketing templates automatically
                    </p>
                  </div>

                  <form onSubmit={handleCreateProject}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Project Name *</label>
                      <input
                        type="text"
                        required
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter project name"
                        disabled={creating}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Describe your project..."
                        disabled={creating}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-md flex-1 flex items-center justify-center gap-2"
                        disabled={creating}
                      >
                        {creating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Creating...
                          </>
                        ) : (
                          'Create Project'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreate(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md"
                        disabled={creating}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div 
                  key={project.projectid} 
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleProjectClick(project.projectid)}
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{project.projectname}</h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {description || 'No description provided'}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs text-gray-500">
                      {project.projecttemplates?.length || 5} templates included
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(project.createdat).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Template Badges */}
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">SEO</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Email</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Social</span>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Automation</span>
                    <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Design</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first project to get started</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}