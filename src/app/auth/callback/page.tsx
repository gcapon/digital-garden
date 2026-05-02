'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      // For OAuth (Google), Supabase redirects here with a code parameter
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('Auth error:', error);
        router.push('/login?error=' + error);
        return;
      }

      if (code) {
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error('Session exchange error:', error);
          router.push('/login?error=callback_error');
        } else if (data.session) {
          router.push('/admin');
        } else {
          router.push('/login?error=no_session');
        }
      } else {
        // No code — try getting existing session (for email confirmation fallback)
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          router.push('/login?error=callback_error');
        } else if (session) {
          router.push('/admin');
        } else {
          router.push('/login?error=no_session');
        }
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FDFAF4',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#2D2A24', fontSize: '16px' }}>Verifying your email…</p>
      </div>
    </div>
  );
}
