import { NextResponse } from 'next/server';
import { supabase } from './../../../sutils/supabaseConfig';

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const category = decodeURIComponent(params.category);

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        projecttemplates (
          templates (*)
        )
      `)
      .eq('projecttype', category)
      .order('createdat', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}