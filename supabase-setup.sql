-- Supabase Database Setup for LeadsFlow180 Project Tracker
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  department TEXT NOT NULL CHECK (department IN ('seo', 'automation', 'social_media', 'email_marketing', 'graphic_design')),
  phase TEXT NOT NULL,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_progress table
CREATE TABLE project_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  in_progress_tasks INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, department)
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_department ON tasks(department);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_project_progress_client ON project_progress(client_id);
CREATE INDEX idx_project_progress_department ON project_progress(department);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (you can modify these later for authentication)
CREATE POLICY "Allow public read access to tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public write access to tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to tasks" ON tasks FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public write access to clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to clients" ON clients FOR DELETE USING (true);

CREATE POLICY "Allow public read access to project_progress" ON project_progress FOR SELECT USING (true);
CREATE POLICY "Allow public write access to project_progress" ON project_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to project_progress" ON project_progress FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_progress_updated_at BEFORE UPDATE ON project_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 