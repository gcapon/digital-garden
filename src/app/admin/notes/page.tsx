import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Note } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminNotesPage() {
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

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  const allNotes = (notes || []) as Note[];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D2A24' }}>
          All Notes
        </h1>
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

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
      }}>
        {['All', 'Published', 'Draft'].map((tab) => (
          <button
            key={tab}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              background: tab === 'All' ? '#2D2A24' : '#FFFFFF',
              color: tab === 'All' ? '#FFFFFF' : '#666',
              border: '1px solid #E8E6E1',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notes Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
      }}>
        {allNotes.length > 0 ? (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px 20px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Tags</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Updated</th>
                <th style={{ textAlign: 'right', padding: '16px 20px', borderBottom: '1px solid #E8E6E1', fontWeight: 600, fontSize: '13px', color: '#999' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allNotes.map((note) => (
                <tr key={note.id}>
                  <td style={{ padding: '16px 20px', borderBottom: '1px solid #F0EDE8' }}>
                    <div>
                      <Link
                        href={`/admin/notes/${note.slug}/edit`}
                        style={{ color: '#2D2A24', textDecoration: 'none', fontWeight: 500 }}
                      >
                        {note.title}
                      </Link>
                      {note.featured_image && (
                        <span style={{ marginLeft: '8px', fontSize: '12px' }}>🖼️</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', borderBottom: '1px solid #F0EDE8' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {note.tags && note.tags.length > 0 ? (
                        note.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '2px 8px',
                              fontSize: '12px',
                              background: '#F0EDE8',
                              borderRadius: '9999px',
                              color: '#666',
                            }}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: '#999' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', borderBottom: '1px solid #F0EDE8' }}>
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
                  <td style={{ padding: '16px 20px', borderBottom: '1px solid #F0EDE8', color: '#666', fontSize: '14px' }}>
                    {new Date(note.updated_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 20px', borderBottom: '1px solid #F0EDE8', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link
                        href={`/garden/${note.slug}`}
                        target="_blank"
                        style={{
                          padding: '6px 12px',
                          fontSize: '13px',
                          color: '#7A9E7E',
                          textDecoration: 'none',
                        }}
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/notes/${note.slug}/edit`}
                        style={{
                          padding: '6px 12px',
                          fontSize: '13px',
                          color: '#2D2A24',
                          textDecoration: 'none',
                        }}
                      >
                        Edit
                      </Link>
                      <form action={`/api/admin/notes/${note.slug}/delete`} method="POST" style={{ display: 'inline' }}>
                        <button
                          type="submit"
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            color: '#DC2626',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '16px', color: '#2D2A24', marginBottom: '8px' }}>
              No notes yet
            </h3>
            <p style={{ marginBottom: '20px' }}>Create your first note to get started.</p>
            <Link
              href="/admin/notes/new"
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                background: '#7A9E7E',
                color: '#FFFFFF',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Create First Note
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}