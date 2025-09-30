'use client';

import { useState } from 'react';
import { socialMediaTasks, getTasksByPhase, Task } from '@/lib/data/social-media-tasks';
import PhaseSection from '@/components/ui/PhaseSection';

export default function SocialMediaChecklistPage() {
  const [tasks, setTasks] = useState<Task[]>(socialMediaTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'All'>('All');

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prevTasks =>
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

  // Filter tasks based on search term and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.phase.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const phases = getTasksByPhase(filteredTasks);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const notStartedTasks = tasks.filter(task => task.status === 'Not Started').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Checklist</h1>
          <p className="text-gray-600">Track and manage social media tasks for your clients</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-purple-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {completedTasks} of {totalTasks} tasks completed ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
          </div>
        </div>

        {/* Phases */}
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

        {phases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 