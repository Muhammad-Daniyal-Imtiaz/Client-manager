import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../sutils/supabaseConfig';

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

interface PhaseWithTasks extends SEOPhase {
  tasks: SEOTask[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: phase, error: phaseError } = await supabase
      .from('seo_phases')
      .select('*')
      .eq('id', id)
      .single();

    if (phaseError) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('seo_tasks')
      .select('*')
      .eq('phase_id', id)
      .order('order_index');

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 400 });
    }

    const phaseWithTasks: PhaseWithTasks = {
      ...phase,
      tasks
    };

    return NextResponse.json(phaseWithTasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    const { data: phase, error } = await supabase
      .from('seo_phases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(phase);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First delete all tasks in this phase
    const { error: tasksError } = await supabase
      .from('seo_tasks')
      .delete()
      .eq('phase_id', id);

    if (tasksError) {
      console.error('Error deleting tasks:', tasksError);
    }

    // Then delete the phase
    const { error } = await supabase
      .from('seo_phases')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Phase and all associated tasks deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}