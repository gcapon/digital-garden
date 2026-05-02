'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Exchange the code in the URL for a session — this is what processes the email confirmation
    supabase.auth.exchangeCodeForSession(window.location.href).then(({ data, error }) => {
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=callback_error');
      } else if (data.session) {
        // Successful verification — redirect to admin
        router.push('/admin');
      } else {
        router.push('/login?error=no_session');
      }
    });
  }, [router]);

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
