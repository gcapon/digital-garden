import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  // Create response that will redirect to /admin
  const response = NextResponse.redirect(new URL('/admin', requestUrl.origin));

  // Create Supabase server client using request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookieHeader = request.headers.get('cookie') || '';
          return cookieHeader.split('; ').reduce((acc, cookie) => {
            const [name, ...rest] = cookie.split('=');
            if (name) {
              acc.push({ name, value: rest.join('=') });
            }
            return acc;
          }, [] as { name: string; value: string }[]);
        },
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

  // Exchange the code for a session
  const code = requestUrl.searchParams.get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      return response;
    }
  }

  // If anything fails, redirect to login
  return NextResponse.redirect(new URL('/login?error=callback_error', requestUrl.origin));
}
