'use client';

import { useState } from 'react';
import { automationTasks, workflowTasks, getTasksByPhase, Task } from '@/lib/data/automation-tasks';
import PhaseSection from '@/components/ui/PhaseSection';

export default function AutomationChecklistPage() {
  const [tasks, setTasks] = useState<Task[]>(automationTasks);
  const [workflowTasksList, setWorkflowTasksList] = useState<Task[]>(workflowTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'All'>('All');
  const [showWorkflows, setShowWorkflows] = useState(false);

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleWorkflowStatusChange = (taskId: string, newStatus: Task['status']) => {
    setWorkflowTasksList(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleAssignmentChange = (taskId: string, assignedTo: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, assignedTo } : task
      )
    );
  };

  const handleWorkflowAssignmentChange = (taskId: string, assignedTo: string) => {
    setWorkflowTasksList(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, assignedTo } : task
      )
    );
  };

  // Filter tasks based on search term and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.phase.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredWorkflowTasks = workflowTasksList.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.phase.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const phases = getTasksByPhase(filteredTasks);
  const workflowPhases = getTasksByPhase(filteredWorkflowTasks);
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const notStartedTasks = tasks.filter(task => task.status === 'Not Started').length;

  const totalWorkflowTasks = workflowTasksList.length;
  const completedWorkflowTasks = workflowTasksList.filter(task => task.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Checklist</h1>
          <p className="text-gray-600">Track and manage automation setup tasks for your clients</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
            <div className="text-sm text-gray-600">Main Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">{inProgressTasks}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-600">{notStartedTasks}</div>
            <div className="text-sm text-gray-600">Not Started</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Tasks
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by task name, phase, or assignee..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Task['status'] | 'All')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowWorkflows(!showWorkflows)}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  showWorkflows 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showWorkflows ? 'Hide Workflows' : 'Show Workflows'}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            {completedTasks} of {totalTasks} main tasks completed ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
          </div>
          
          {showWorkflows && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${totalWorkflowTasks > 0 ? (completedWorkflowTasks / totalWorkflowTasks) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                {completedWorkflowTasks} of {totalWorkflowTasks} workflow tasks completed ({totalWorkflowTasks > 0 ? Math.round((completedWorkflowTasks / totalWorkflowTasks) * 100) : 0}%)
              </div>
            </>
          )}
        </div>

        {/* Main Phases */}
        <div className="space-y-8">
          {phases.map(({ phase, tasks: phaseTasks }) => (
            <PhaseSection
              key={phase}
              phase={phase}
              tasks={phaseTasks}
              onStatusChange={handleStatusChange}
              onAssignmentChange={handleAssignmentChange}
            />
          ))}
        </div>

        {/* Workflow Phases */}
        {showWorkflows && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Workflow Details</h2>
            <div className="space-y-8">
              {workflowPhases.map(({ phase, tasks: phaseTasks }) => (
                <PhaseSection
                  key={phase}
                  phase={phase}
                  tasks={phaseTasks}
                  onStatusChange={handleWorkflowStatusChange}
                  onAssignmentChange={handleWorkflowAssignmentChange}
                />
              ))}
            </div>
          </div>
        )}

        {phases.length === 0 && workflowPhases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 