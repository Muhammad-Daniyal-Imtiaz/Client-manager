// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './../sutils/supabaseConfig';



export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'signin' || action === 'signup') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${request.nextUrl.origin}/api/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (data?.url) {
        return NextResponse.json({ url: data.url });
      }

      return NextResponse.json(
        { error: 'Failed to generate OAuth URL' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "signin" or "signup"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}