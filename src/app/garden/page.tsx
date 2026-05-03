import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Sidebar } from '@/components/Sidebar';
import { NoteCard } from '@/components/NoteCard';
import { SearchBar } from '@/components/SearchBar';
import Link from 'next/link';
import { Note, Tag } from '@/types';

export const dynamic = 'force-dynamic';

export default async function GardenPage() {
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

  // Fetch published notes and all tags
  const [{ data: notes }, { data: tags }] = await Promise.all([
    supabase
      .from('notes')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('tags').select('*').order('name'),
  ]);

  const publishedNotes = (notes || []) as Note[];
  const allTags = (tags || []) as Tag[];
  const featuredNote = publishedNotes[0];
  const otherNotes = publishedNotes.slice(1);

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
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 50,
      }}>
        <SearchBar />
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

      <div style={{ display: 'flex', paddingTop: '64px' }}>
        {/* Sidebar */}
        <Sidebar tags={allTags} notes={publishedNotes} />

        {/* Main Content */}
        <main style={{
          flex: 1,
          marginLeft: '260px',
          padding: '40px',
          maxWidth: '1200px',
        }}>
          {/* Featured Note */}
          {featuredNote && (
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '16px',
              }}>
                ✨ Featured
              </h2>
              <NoteCard note={featuredNote} featured />
            </div>
          )}

          {/* All Notes Grid */}
          <div>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px',
            }}>
              All Notes ({otherNotes.length})
            </h2>
            {otherNotes.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
              }}>
                {otherNotes.map(note => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              publishedNotes.length <= 1 && (
                <div style={{
                  padding: '60px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '2px dashed #E8E6E1',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
                  <h3 style={{ fontSize: '18px', color: '#2D2A24', marginBottom: '8px' }}>
                    Your garden is empty
                  </h3>
                  <p style={{ color: '#999', marginBottom: '20px' }}>
                    Start planting notes to grow your digital garden.
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
                    Create your first note
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: '80px',
            padding: '24px 0',
            borderTop: '1px solid #E8E6E1',
            textAlign: 'center',
            color: '#999',
            fontSize: '13px',
          }}>
            🌿 Digital Garden — tends ideas that grow over time
          </footer>
        </main>
      </div>
    </div>
  );
}