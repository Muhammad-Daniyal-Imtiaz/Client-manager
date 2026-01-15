import { NextResponse } from 'next/server';
import { supabase } from './../sutils/supabaseConfig';

export async function GET() {
  try {
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select(`
        *,
        templatephases (
          *,
          templatetasks (*)
        )
      `)
      .order('templateid', { ascending: true });

    if (templatesError) {
      console.error('Supabase templates error:', templatesError);
      throw templatesError;
    }

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}