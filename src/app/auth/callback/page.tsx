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
  const [debug, setDebug] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      setDebug('Hash found: ' + hash.substring(0, 50) + '...');

      if (!hash || !hash.includes('access_token=')) {
        setDebug('No access_token in hash. Hash: ' + (hash || 'empty'));
        setError('no_token');
        return;
      }

      // Parse tokens from URL hash
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      setDebug('Access token found: ' + (accessToken ? 'yes, length=' + accessToken.length : 'no'));

      if (!accessToken) {
        setError('no_token');
        return;
      }

      // Set the session in Supabase client
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      setDebug('setSession result - error: ' + (sessionError?.message || 'none') + ', session: ' + (data.session ? 'yes' : 'no'));

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      router.push('/admin');
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
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <p style={{ color: '#2D2A24', fontSize: '16px' }}>Logging you in…</p>
        {debug && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            textAlign: 'left',
            color: '#333',
          }}>
            DEBUG: {debug}
          </div>
        )}
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#DC2626',
            fontSize: '14px',
          }}>
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
