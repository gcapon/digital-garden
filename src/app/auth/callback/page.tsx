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
    const handleAuth = async () => {
      const hash = window.location.hash;

      // Supabase sends tokens in the URL hash after OAuth
      if (hash.includes('access_token=')) {
        // Parse tokens from URL hash
        const params = new URLSearchParams(hash.substring(1)); // Remove the leading #
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('Set session error:', error);
            router.push('/login?error=callback_error');
          } else {
            router.push('/admin');
          }
          return;
        }
      }

      // Fallback: try exchangeCodeForSession (for email confirmation)
      const code = new URLSearchParams(hash.substring(1)).get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error || !data.session) {
          router.push('/login?error=callback_error');
        } else {
          router.push('/admin');
        }
        return;
      }

      // No tokens found - redirect to login
      router.push('/login?error=no_session');
    };

    handleAuth();
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
        <p style={{ color: '#2D2A24', fontSize: '16px' }}>Logging you in…</p>
      </div>
    </div>
  );
}
