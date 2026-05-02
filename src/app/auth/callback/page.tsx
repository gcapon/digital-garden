'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        console.error('Auth error:', errorParam);
        router.push('/login?error=' + errorParam);
        return;
      }

      if (code) {
        // Exchange code for session (handles email confirmation and Google OAuth)
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
        // No code — check if there's already a session (email confirmation fallback)
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

function LoadingFallback() {
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
