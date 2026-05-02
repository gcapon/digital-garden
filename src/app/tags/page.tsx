import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Tag } from '@/types';

export const dynamic = 'force-dynamic';

export default async function TagsPage() {
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

  const { data: tags } = await supabase
    .from('tags')
    .select(`
      *,
      note_tags(count)
    `)
    .order('name');

  const typedTags = (tags || []) as (Tag & { note_tags: { count: number }[] })[];

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
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#2D2A24',
          marginBottom: '8px',
        }}>
          🏷️ Tags
        </h1>
        <p style={{ color: '#999', marginBottom: '40px' }}>
          Browse all {typedTags.length} tags in the garden
        </p>

        {typedTags.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {typedTags.map(tag => {
              const count = tag.note_tags?.[0]?.count || 0;
              return (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  style={{
                    display: 'block',
                    padding: '20px',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
                    transition: 'all 200ms ease',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 12px',
                      background: '#7A9E7E',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}>
                      {tag.name}
                    </span>
                    <span style={{ fontSize: '13px', color: '#999' }}>
                      {count} note{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '2px dashed #E8E6E1',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
            <p style={{ color: '#999' }}>No tags yet</p>
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