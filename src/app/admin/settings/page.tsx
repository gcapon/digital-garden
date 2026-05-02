import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D2A24' }}>
          Settings
        </h1>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '4px' }}>
          Manage your account preferences
        </p>
      </div>

      {/* Account Info */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
        maxWidth: '500px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#2D2A24', marginBottom: '20px' }}>
          Account Information
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#999', marginBottom: '4px' }}>
            Email
          </label>
          <div style={{ fontSize: '15px', color: '#2D2A24' }}>
            {user?.email || 'Not available'}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#999', marginBottom: '4px' }}>
            User ID
          </label>
          <div style={{ fontSize: '13px', color: '#666', fontFamily: 'monospace' }}>
            {user?.id || 'Not available'}
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E8E6E1' }}>
          <p style={{ fontSize: '13px', color: '#999' }}>
            To update your email or password, use the Supabase authentication settings.
          </p>
        </div>
      </div>
    </div>
  );
}