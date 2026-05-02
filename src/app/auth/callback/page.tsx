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
  const [debug, setDebug] = useState([]);

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      addDebug('Hash length: ' + hash.length);

      if (!hash || !hash.includes('access_token=')) {
        addDebug('No access_token in hash');
        return;
      }

      // Parse tokens from URL hash
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      addDebug('Access token length: ' + (accessToken?.length || 0));
      addDebug('Refresh token length: ' + (refreshToken?.length || 0));

      if (!accessToken) {
        addDebug('ERROR: No access token parsed');
        return;
      }

      // Set the session in Supabase client
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) {
        addDebug('ERROR: ' + error.message);
      } else {
        addDebug('Session set successfully');
        addDebug('User email: ' + data.session?.user?.email);
      }

      // Stop here so we can read the debug output
    };

    handleAuth();
  }, []);

  const addDebug = (msg: string) => {
    setDebug(prev => [...prev, msg]);
  };

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
          <p style={{ color: '#666' }}>No debug info yet...</p>
        )}
        {debug.includes('Session set successfully') && (
          <p style={{ marginTop: '20px', color: '#7A9E7E' }}>✓ Success! Redirecting to admin...</p>
        )}
      </div>
    </div>
  );
}
