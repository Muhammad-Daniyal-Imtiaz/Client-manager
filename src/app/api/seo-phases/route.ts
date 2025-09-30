import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './../sutils/supabaseConfig';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase.from('seo_phases').select('*');

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: phases, error } = await query.order('order_index');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(phases);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const phaseData: Partial<SEOPhase> = await request.json();

    // Get the current max order_index for this project
    const { data: maxOrderData } = await supabase
      .from('seo_phases')
      .select('order_index')
      .eq('project_id', phaseData.project_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = maxOrderData ? maxOrderData.order_index + 1 : 0;

    const { data: phase, error } = await supabase
      .from('seo_phases')
      .insert([{
        ...phaseData,
        status: phaseData.status || 'Not Started',
        order_index: nextOrderIndex
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(phase, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}