'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    // Get the token from the URL hash or query params
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setValidating(false);
    } else {
      // Check if we have a session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setValidating(false);
        } else {
          setError('This reset link is invalid or has expired.');
          setValidating(false);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (validating) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDFAF4',
      }}>
        <p style={{ color: '#2D2A24' }}>Validating reset link…</p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDFAF4',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#2D2A24', marginBottom: '8px' }}>Password reset!</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Your password has been changed. You can now sign in with your new password.</p>
          <Link href="/login" style={{
            padding: '14px 24px',
            background: '#2D2A24',
            color: '#FDFAF4',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

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

        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(45, 42, 36, 0.08)',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#2D2A24', textAlign: 'center', marginBottom: '8px' }}>
            Set New Password
          </h1>
          <p style={{ fontSize: '14px', color: '#999', textAlign: 'center', marginBottom: '32px' }}>
            Enter your new password below.
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
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '8px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#2D2A24', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Repeat your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '8px',
                  outline: 'none',
                }}
              />
            </div>

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
              }}
            >
              {isLoading ? 'Please wait...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
