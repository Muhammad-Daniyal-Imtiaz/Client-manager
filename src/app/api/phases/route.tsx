import { NextResponse } from 'next/server';
import { supabase } from '../sutils/supabaseConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectid, phasename, phaseorder } = body;

    if (!projectid || !phasename) {
      return NextResponse.json(
        { error: 'Project ID and phase name are required' },
        { status: 400 }
      );
    }

    const { data: phase, error: phaseError } = await supabase
      .from('phases')
      .insert([
        { 
          projectid, 
          phasename, 
          phaseorder: phaseorder || 1 
        }
      ])
      .select()
      .single();

    if (phaseError) throw phaseError;

    return NextResponse.json(phase, { status: 201 });
  } catch (error) {
    console.error('Error creating phase:', error);
    return NextResponse.json(
      { error: 'Failed to create phase' },
      { status: 500 }
    );
  }
}