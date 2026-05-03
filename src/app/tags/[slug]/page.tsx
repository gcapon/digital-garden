import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { NoteCard } from '@/components/NoteCard';
import { Tag, Note } from '@/types';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagNotesPage({ params }: PageProps) {
  const { slug } = await params;

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

  // Get tag
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!tag) {
    notFound();
  }

  const typedTag = tag as Tag;

  // Get notes with this tag
  // Get all published notes and filter by tag manually for text[] lookup
  const { data: allNotes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Filter notes that contain this tag (text[] column)
  const notes = (allNotes || []).filter(note => 
    note.tags && Array.isArray(note.tags) && note.tags.includes(typedTag.name)
  ) as Note[];

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
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '100px 40px 40px',
      }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#999' }}>
          <Link href="/tags" style={{ color: '#7A9E7E', textDecoration: 'none' }}>
            Tags
          </Link>
          <span style={{ margin: '0 8px' }}>→</span>
          <span>{typedTag.name}</span>
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#2D2A24',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            display: 'inline-flex',
            padding: '6px 16px',
            background: '#7A9E7E',
            color: '#FFFFFF',
            borderRadius: '9999px',
            fontSize: '16px',
          }}>
            {typedTag.name}
          </span>
        </h1>
        <p style={{ color: '#999', marginBottom: '40px' }}>
          {notes.length} note{notes.length !== 1 ? 's' : ''} tagged with "{typedTag.name}"
        </p>

        {notes.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {notes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '2px dashed #E8E6E1',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p style={{ color: '#999' }}>No published notes with this tag yet</p>
          </div>
        )}

        <footer style={{
          marginTop: '80px',
          padding: '24px 0',
          borderTop: '1px solid #E8E6E1',
          textAlign: 'center',
          color: '#999',
          fontSize: '13px',
        }}>
          <Link href="/garden" style={{ color: '#7A9E7E', textDecoration: 'none' }}>
            ← Back to Garden
          </Link>
        </footer>
      </div>
    </div>
  );
}