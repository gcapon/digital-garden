import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: 'No access token' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    // Create server client to validate the token and set session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                httpOnly: options?.httpOnly ?? true,
                secure: options?.secure ?? true,
                sameSite: options?.sameSite ?? 'lax',
                maxAge: options?.maxAge ?? 60 * 60 * 24 * 7,
                path: options?.path ?? '/',
              });
            });
          },
        },
      }
    );

    // This validates the token and sets session cookies
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
