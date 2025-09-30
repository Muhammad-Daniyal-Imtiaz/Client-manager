import { supabase, Task, Client, ProjectProgress } from './supabase'

// Task Management
export const taskService = {
  // Get all tasks for a department
  async getTasksByDepartment(department: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data as Task[]
  },

  // Update task status
  async updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed') {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .select()
    
    if (error) throw error
    return data[0] as Task
  },

  // Assign task to team member
  async assignTask(taskId: string, assignedTo: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        assigned_to: assignedTo,
        updated_at: new Date().toISOString() 
      })
      .eq('id', taskId)
      .select()
    
    if (error) throw error
    return data[0] as Task
  },

  // Create new task
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data[0] as Task
  }
}

// Client Management
export const clientService = {
  // Get all clients
  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Client[]
  },

  // Create new client
  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...client,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data[0] as Client
  },

  // Update client
  async updateClient(clientId: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select()
    
    if (error) throw error
    return data[0] as Client
  },

  // Delete client
  async deleteClient(clientId: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
    
    if (error) throw error
  }
}

// Project Progress Management
export const progressService = {
  // Get progress for a client and department
  async getProgress(clientId: string, department: string) {
    const { data, error } = await supabase
      .from('project_progress')
      .select('*')
      .eq('client_id', clientId)
      .eq('department', department)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as ProjectProgress | null
  },

  // Update progress
  async updateProgress(progress: Omit<ProjectProgress, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('project_progress')
      .upsert({
        ...progress,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data[0] as ProjectProgress
  },

  // Get overall stats
  async getOverallStats() {
    const { data, error } = await supabase
      .from('project_progress')
      .select('*')
    
    if (error) throw error
    
    const stats = {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      pendingTasks: 0
    }
    
    data?.forEach(progress => {
      stats.totalTasks += progress.total_tasks
      stats.completedTasks += progress.completed_tasks
      stats.inProgressTasks += progress.in_progress_tasks
      stats.pendingTasks += progress.pending_tasks
    })
    
    return stats
  }
} 