import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  // Check for error first
  const error = requestUrl.searchParams.get('error');
  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + error, requestUrl.origin));
  }

  // Parse tokens from URL fragment (Supabase sends them there after OAuth)
  const hash = requestUrl.hash;
  const accessToken = hash.includes('access_token=')
    ? hash.split('access_token=')[1].split('&')[0]
    : null;
  const refreshToken = hash.includes('refresh_token=')
    ? hash.split('refresh_token=')[1].split('&')[0]
    : null;

  if (accessToken) {
    // Create response that will redirect to /admin
    const response = NextResponse.redirect(new URL('/admin', requestUrl.origin));

    // Set the session cookies
    response.cookies.set('sb-access-token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    if (refreshToken) {
      response.cookies.set('sb-refresh-token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  }

  // If no code and no tokens, redirect to login
  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin));
}
