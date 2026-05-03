import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Note } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
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

  // Fetch stats - use count() for accurate counts
  const [
    { count: totalCount },
    { count: publishedCount },
    { count: draftCount },
    { count: tagCount },
  ] = await Promise.all([
    supabase.from('notes').select('*', { count: 'exact', head: true }),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
  ]);

  // Fetch recent notes
  const { data: recentNotes } = await supabase
    .from('notes')
    .select('id, title, slug, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { label: 'Total Notes', value: totalCount || 0, icon: '📝' },
    { label: 'Published', value: publishedCount || 0, icon: '✅' },
    { label: 'Drafts', value: draftCount || 0, icon: '📝' },
    { label: 'Tags', value: tagCount || 0, icon: '🏷️' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D2A24' }}>
            Dashboard
          </h1>
          <p style={{ color: '#999', fontSize: '14px', marginTop: '4px' }}>
            Welcome back, {user?.email}
          </p>
        </div>
        <Link
          href="/admin/notes/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: '#7A9E7E',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          ➕ New Note
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '40px',
      }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#2D2A24' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Notes */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#2D2A24' }}>
            Recent Notes
          </h2>
          <Link
            href="/admin/notes"
            style={{
              fontSize: '14px',
              color: '#7A9E7E',
              textDecoration: 'none',
            }}
          >
            View all →
          </Link>
        </div>

        {recentNotes && recentNotes.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Created</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(recentNotes as Note[]).map((note) => (
                <tr key={note.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F0EDE8' }}>
                    <Link
                      href={`/admin/notes/${note.slug}/edit`}
                      style={{ color: '#2D2A24', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {note.title}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F0EDE8' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: note.status === 'published' ? '#D1FAE5' : '#FEF3C7',
                      color: note.status === 'published' ? '#065F46' : '#92400E',
                    }}>
                      {note.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F0EDE8', color: '#666', fontSize: '14px' }}>
                    {new Date(note.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #F0EDE8', textAlign: 'right' }}>
                    <Link
                      href={`/admin/notes/${note.slug}/edit`}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        color: '#7A9E7E',
                        textDecoration: 'none',
                      }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <p>No notes yet. Create your first note!</p>
          </div>
        )}
      </div>
    </div>
  );
}