import { NextResponse } from 'next/server';
import { supabase } from './../../../sutils/supabaseConfig';
import { createClient } from '@/utils/supabase/server';
import { hasPermission } from '@/utils/permissionHelpers';


export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectid: string }> }
) {
    try {
        const { projectid } = await params;
        const projectId = parseInt(projectid);
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const permissionType = url.searchParams.get('permission');

        if (!permissionType) {
            return NextResponse.json({ error: 'Permission type required' }, { status: 400 });
        }

        const hasPerm = await hasPermission(supabase, user.id, projectId, permissionType);

        return NextResponse.json({ hasPermission: hasPerm }, { status: 200 });
    } catch (error) {
        console.error('Error checking permission:', error);
        return NextResponse.json(
            { error: 'Failed to check permission' },
            { status: 500 }
        );
    }
}