import { NextResponse } from 'next/server';
import { supabase } from '../../../../sutils/supabaseConfig';

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
      .eq('phaseid', phaseid)
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
      .eq('phaseid', phaseid);

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