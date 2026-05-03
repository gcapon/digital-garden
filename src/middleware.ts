import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function middleware(request: any) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (but not /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Try to find the access token cookie
    const accessToken = allCookies.find(c => c.name === 'sb-access-token')?.value;

    if (accessToken) {
      // If we have the token cookie, use it directly to get the user
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => allCookies,
            setAll: () => {},
          },
        }
      );

      // Pass the access token directly to getUser
      const { data: { user } } = await supabase.auth.getUser(accessToken);

      if (user) {
        return NextResponse.next();
      }
    }

    // No valid session found - redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
