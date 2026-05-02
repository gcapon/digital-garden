'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setError('Check your email for a password reset link!');
        setIsLoading(false);
        return;
      }

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'https://digital-garden-mu-azure.vercel.app/auth/callback' } });
        if (error) throw error;
        setError('Check your email for a confirmation link!');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'forgot' ? 'Reset Password' : mode === 'signup' ? 'Create Account' : 'Welcome Back';
  const subtitle = mode === 'forgot'
    ? 'Enter your email and we\'ll send you a reset link'
    : mode === 'signup' ? 'Start building your digital garden' : 'Sign in to manage your garden';
  const buttonLabel = isLoading ? 'Please wait...' : mode === 'forgot' ? 'Send Reset Link' : mode === 'signup' ? 'Create Account' : 'Sign In';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FDFAF4',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/garden" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '24px',
            fontWeight: 600,
            color: '#2D2A24',
            textDecoration: 'none',
          }}>
            🌿 Digital Garden
          </Link>
        </div>

        {/* Form Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(45, 42, 36, 0.08)',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#2D2A24', textAlign: 'center', marginBottom: '8px' }}>
            {title}
          </h1>
          <p style={{ fontSize: '14px', color: '#999', textAlign: 'center', marginBottom: '32px' }}>
            {subtitle}
          </p>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#2D2A24', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
              />
            </div>

            {mode !== 'forgot' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#2D2A24', marginBottom: '8px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    border: '1.5px solid #E0DDD8',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 150ms ease',
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#FDFAF4',
                background: '#2D2A24',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 150ms ease',
              }}
            >
              {buttonLabel}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
            {mode === 'signin' && (
              <>
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: '#7A9E7E', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Sign up</button>
                <br />
                <button onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: '#C67B5D', cursor: 'pointer', fontWeight: 500, padding: 0, fontSize: '13px', marginTop: '8px' }}>Forgot password?</button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: '#7A9E7E', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Sign in</button>
              </>
            )}
            {mode === 'forgot' && (
              <>
                Remember your password?{' '}
                <button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: '#7A9E7E', cursor: 'pointer', fontWeight: 500, padding: 0 }}>Sign in</button>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#999' }}>
          <Link href="/garden" style={{ color: '#7A9E7E', textDecoration: 'none' }}>← Back to Garden</Link>
        </p>
      </div>
    </div>
  );
}
