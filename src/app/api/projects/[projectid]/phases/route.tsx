import { NextResponse } from 'next/server';
import { supabase } from './../../../sutils/supabaseConfig';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectid: string }> }
) {
  try {
    const { projectid } = await params;
    const body = await request.json();
    const { phasename, phaseorder } = body;

    if (!phasename) {
      return NextResponse.json(
        { error: 'Phase name is required' },
        { status: 400 }
      );
    }

    // Get the max phase order if not provided
    let order = phaseorder;
    if (!order) {
      const { data: phases, error: phasesError } = await supabase
        .from('phases')
        .select('phaseorder')
        .eq('projectid', projectid)
        .order('phaseorder', { ascending: false })
        .limit(1);

      if (phasesError) throw phasesError;
      order = phases && phases.length > 0 ? phases[0].phaseorder + 1 : 1;
    }

    const { data: phase, error: phaseError } = await supabase
      .from('phases')
      .insert([
        { 
          projectid: parseInt(projectid), 
          phasename, 
          phaseorder: order,
          status: 'Not Started'
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