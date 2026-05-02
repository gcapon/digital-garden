'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const [debug, setDebug] = useState<string[]>([]);

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;

      if (!hash || !hash.includes('access_token=')) {
        setDebug(prev => [...prev, 'No access_token in hash']);
        return;
      }

      // Parse tokens from URL hash
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        setDebug(prev => [...prev, 'ERROR: No access token parsed']);
        return;
      }

      // Set the session in Supabase client (stores in memory/localStorage)
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) {
        setDebug(prev => [...prev, 'ERROR: ' + error.message]);
        return;
      }

      setDebug(prev => [...prev, 'Session set in Supabase client']);

      // Now also set cookies explicitly so the Next.js middleware can read them
      // Cookie format that Supabase expects: sb-access-token and sb-refresh-token
      document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; secure`;
      if (refreshToken) {
        document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; secure`;
      }

      setDebug(prev => [...prev, 'Cookies set explicitly']);

      // Verify by getting session back
      const { data: verifyData } = await supabase.auth.getSession();
      setDebug(prev => [...prev, 'getSession after setSession: ' + (verifyData.session?.user?.email || 'no session')]);

      // Redirect after a short delay so you can see the output
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
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
      padding: '20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <p style={{ color: '#2D2A24', fontSize: '16px', marginBottom: '20px' }}>Auth Callback</p>
        {debug.length > 0 ? (
          <div style={{
            padding: '16px',
            background: '#1a1a1a',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            textAlign: 'left',
            color: '#0f0',
            whiteSpace: 'pre-wrap',
          }}>
            {debug.map((msg, i) => <div key={i}>{msg}</div>)}
          </div>
        ) : (
          <p style={{ color: '#666' }}>Processing...</p>
        )}
      </div>
    </div>
  );
}
