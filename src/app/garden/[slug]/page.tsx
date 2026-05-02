import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Sidebar } from '@/components/Sidebar';
import { TagPill } from '@/components/TagPill';
import { BacklinkPanel } from '@/components/BacklinkPanel';
import { formatDate } from '@/lib/utils';
import { renderMarkdownSync } from '@/lib/markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Note, Tag } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NotePage({ params }: PageProps) {
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

  // Fetch note
  const { data: note, error } = await supabase
    .from('notes')
    .select(`
      *,
      tags:note_tags(tag:id, name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (error || !note || note.status !== 'published') {
    notFound();
  }

  const typedNote = note as Note & { tags: { tag: Tag }[] };
  const noteTags = typedNote.tags?.map(t => t.tag) || [];

  // Get backlinks
  const { data: links } = await supabase
    .from('note_links')
    .select('from_note_id')
    .eq('to_note_id', note.id);

  const backlinkIds = links?.map(l => l.from_note_id) || [];
  let backlinks: Note[] = [];

  if (backlinkIds.length > 0) {
    const { data: linkedNotes } = await supabase
      .from('notes')
      .select('id, title, slug, excerpt')
      .in('id', backlinkIds)
      .eq('status', 'published');
    backlinks = (linkedNotes || []) as Note[];
  }

  // Render markdown
  const htmlContent = renderMarkdownSync(note.content);

  // Fetch all tags for sidebar
  const { data: tags } = await supabase.from('tags').select('*').order('name');
  const allTags = (tags || []) as Tag[];

  // Fetch all notes for graph
  const { data: allNotes } = await supabase
    .from('notes')
    .select('id, title, slug, content')
    .eq('status', 'published');

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

      <div style={{ display: 'flex', paddingTop: '64px' }}>
        {/* Sidebar */}
        <Sidebar tags={allTags} notes={(allNotes || []) as Note[]} />

        {/* Main Content */}
        <main style={{
          flex: 1,
          marginLeft: '260px',
          padding: '40px',
          maxWidth: '900px',
        }}>
          <article>
            {/* Title */}
            <h1 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#2D2A24',
              marginBottom: '16px',
              lineHeight: 1.3,
            }}>
              {note.title}
            </h1>

            {/* Meta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
              color: '#999',
              fontSize: '14px',
            }}>
              <span>{formatDate(note.created_at)}</span>
              {noteTags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {noteTags.map(tag => (
                    <TagPill key={tag.id} tag={tag} clickable={false} />
                  ))}
                </div>
              )}
            </div>

            {/* Featured Image */}
            {note.featured_image && (
              <div style={{
                marginBottom: '32px',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <img
                  src={note.featured_image}
                  alt={note.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            )}

            {/* Content */}
            <div
              className="markdown-content"
              style={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Backlinks */}
            <BacklinkPanel backlinks={backlinks} />
          </article>

          {/* Footer */}
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
        </main>
      </div>
    </div>
  );
}