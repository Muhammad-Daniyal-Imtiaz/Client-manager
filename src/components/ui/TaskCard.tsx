'use client';

import { useState } from 'react';

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

interface TaskCardProps {
  task: SEOTask;
  onStatusChange: (taskId: string, newStatus: SEOTask['status']) => void;
  onAssignmentChange: (taskId: string, assignedTo: string) => void;
}

export default function TaskCard({ task, onStatusChange, onAssignmentChange }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to);

  const getStatusColor = (status: SEOTask['status']) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: SEOTask['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (newStatus: SEOTask['status']) => {
    onStatusChange(task.id, newStatus);
  };

  const handleAssignmentSave = () => {
    onAssignmentChange(task.id, assignedTo);
    setIsEditing(false);
  };

  const handleAssignmentCancel = () => {
    setAssignedTo(task.assigned_to);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm leading-tight">
          {task.name}
        </h3>
        <div className="flex flex-col items-end space-y-1">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as SEOTask['status'])}
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)} border-0 focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {task.priority && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3">{task.description}</p>
      )}

      {task.estimated_hours && (
        <p className="text-xs text-gray-500 mb-2">Estimated: {task.estimated_hours}h</p>
      )}

      {task.due_date && (
        <p className="text-xs text-gray-500 mb-2">
          Due: {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Assigned to:</span>
          {isEditing ? (
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 w-24"
                placeholder="Name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAssignmentSave();
                  if (e.key === 'Escape') handleAssignmentCancel();
                }}
              />
              <button
                onClick={handleAssignmentSave}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleAssignmentCancel}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-gray-700">
                {task.assigned_to}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}