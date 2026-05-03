'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;

      if (!hash || !hash.includes('access_token=')) {
        // Redirect to login if no token
        window.location.href = '/login?error=no_session';
        return;
      }

      // Parse tokens from URL hash
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        window.location.href = '/login?error=no_session';
        return;
      }

      // Call our server-side API route to set cookies properly
      try {
        const response = await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
        });

        if (response.ok) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/login?error=callback_error';
        }
      } catch {
        window.location.href = '/login?error=callback_error';
      }
    };

    handleAuth();
  }, []);

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
