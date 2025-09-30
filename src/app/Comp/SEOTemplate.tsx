'use client';

import React, { useState, useEffect } from 'react';

interface SEOTemplateProps {
  onCreateProject: (projectData: any) => void;
  projects: any[];
  onProjectClick: (projectId: number) => void;
}

const SEOTemplate: React.FC<SEOTemplateProps> = ({ onCreateProject, projects, onProjectClick }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        const seoTemplate = data.templates.find((t: any) => t.category === 'SEO');
        setTemplateData(seoTemplate);
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    };

    fetchTemplate();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject({
      projectname: projectName,
      description,
      projecttype: 'SEO'
    });
    setProjectName('');
    setDescription('');
    setShowCreate(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">SEO Projects</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplate(!showTemplate)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            {showTemplate ? 'Hide Template' : 'View Template'}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create SEO Project
          </button>
        </div>
      </div>

      {showTemplate && templateData && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{templateData.templatename}</h3>
          <p className="text-gray-600 mb-4">{templateData.description}</p>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm font-medium">
              💡 This template will be included along with 4 other templates when you create a project
            </p>
          </div>
          
          <div className="space-y-4">
            {templateData.templatephases?.map((phase: any) => (
              <div key={phase.templatephaseid} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-lg">{phase.phasename}</h4>
                <ul className="mt-2 space-y-1">
                  {phase.templatetasks?.map((task: any) => (
                    <li key={task.templatetaskid} className="text-sm text-gray-600">
                      • {task.taskdescription}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Create SEO Project</h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700 text-sm">
                This project will include all 5 templates: SEO, Email Marketing, Social Media, Automation, and Graphic Design
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div 
            key={project.projectid} 
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onProjectClick(project.projectid)}
          >
            <h3 className="font-semibold text-lg mb-2">{project.projectname}</h3>
            <p className="text-gray-600 text-sm mb-3">{project.description}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {project.projecttype}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(project.createdat).toLocaleDateString()}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Includes {project.projecttemplates?.length || 5} templates
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEOTemplate;