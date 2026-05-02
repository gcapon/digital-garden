'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If URL has auth-related hash params (from Supabase email verification
    // or password reset), redirect to the appropriate handler page
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      router.replace('/reset-password');
    } else if (hash.includes('type=signup') || hash.includes('confirmation_token')) {
      router.replace('/login');
    } else {
      router.replace('/garden');
    }
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FDFAF4',
    }}>
      <p style={{ color: '#2D2A24' }}>Loading…</p>
    </div>
  );
}
