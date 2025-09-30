'use client';

import TaskCard from "./TaskCard";

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
}

interface PhaseSectionProps {
  phase: SEOPhase;
  tasks: SEOTask[];
  onStatusChange: (taskId: string, newStatus: SEOTask['status']) => void;
  onAssignmentChange: (taskId: string, assignedTo: string) => void;
}

export default function PhaseSection({ 
  phase, 
  tasks, 
  onStatusChange, 
  onAssignmentChange 
}: PhaseSectionProps) {
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{phase.name}</h2>
          {phase.description && (
            <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {completedTasks} of {totalTasks} completed
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onAssignmentChange={onAssignmentChange}
          />
        ))}
      </div>
    </div>
  );
}