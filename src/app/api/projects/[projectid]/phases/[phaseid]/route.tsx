import { NextResponse } from 'next/server';
import { supabase } from '../../../../sutils/supabaseConfig';


// Add GET method to fetch a specific phase
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string }> }
) {
  try {
    const { phaseid } = await params;

    const { data: phase, error: phaseError } = await supabase
      .from('phases')
      .select(`
        *,
        project_tasks (
          *,
          project_task_assignments (
            *,
            users (*)
          )
        )
      `)
      .eq('phaseid', parseInt(phaseid))
      .single();

    if (phaseError) {
      console.error('Phase fetch error:', phaseError);
      return NextResponse.json(
        { error: 'Failed to fetch phase', details: phaseError.message },
        { status: 500 }
      );
    }

    if (!phase) {
      return NextResponse.json(
        { message: 'Phase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ phase }, { status: 200 });

  } catch (error) {
    console.error('Error fetching phase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phase' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string }> }
) {
  try {
    const { phaseid } = await params;
    const body = await request.json();
    const { phasename, status } = body;

    if (!phasename) {
      return NextResponse.json(
        { error: 'Phase name is required' },
        { status: 400 }
      );
    }

    const { data: phase, error: phaseError } = await supabase
      .from('phases')
      .update({ phasename, status })
      .eq('phaseid', parseInt(phaseid))
      .select()
      .single();

    if (phaseError) throw phaseError;

    return NextResponse.json(phase, { status: 200 });
  } catch (error) {
    console.error('Error updating phase:', error);
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectid: string; phaseid: string }> }
) {
  try {
    const { phaseid } = await params;

    const { error } = await supabase
      .from('phases')
      .delete()
      .eq('phaseid', parseInt(phaseid));

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Phase deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}