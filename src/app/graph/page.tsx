import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { GraphVisualization } from '@/components/GraphVisualization';
import { Note } from '@/types';

export const dynamic = 'force-dynamic';

export default async function GraphPage() {
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

  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, slug, content')
    .eq('status', 'published');

  const publishedNotes = (notes || []) as Note[];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Bar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E6E1',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 50,
      }}>
        <Link href="/garden" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '18px',
          fontWeight: 600,
          color: '#2D2A24',
          textDecoration: 'none',
        }}>
          🌿 Digital Garden
        </Link>
        <div style={{ flex: 1 }} />
        <Link
          href="/login"
          style={{
            padding: '8px 16px',
            background: '#2D2A24',
            color: '#FDFAF4',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Login
        </Link>
      </header>

      <div style={{
        paddingTop: '64px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Page Header */}
        <div style={{
          padding: '24px 40px',
          borderBottom: '1px solid #E8E6E1',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#2D2A24',
            marginBottom: '4px',
          }}>
            🕸️ Knowledge Graph
          </h1>
          <p style={{ color: '#999', fontSize: '14px' }}>
            {publishedNotes.length} note{publishedNotes.length !== 1 ? 's' : ''} · Click any node to open the note
          </p>
        </div>

        {/* Full-page Graph */}
        <div style={{
          flex: 1,
          padding: '20px 40px 40px',
        }}>
          {publishedNotes.length > 0 ? (
            <div style={{
              width: '100%',
              height: '100%',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
              overflow: 'hidden',
            }}>
              <GraphVisualization notes={publishedNotes} />
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: '#FFFFFF',
              borderRadius: '12px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕸️</div>
                <h3 style={{ fontSize: '18px', color: '#2D2A24', marginBottom: '8px' }}>
                  No notes to visualize yet
                </h3>
                <p style={{ color: '#999', marginBottom: '20px' }}>
                  Create some notes with [[links]] to see the graph come alive.
                </p>
                <Link
                  href="/login"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: '#7A9E7E',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Start writing notes
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}