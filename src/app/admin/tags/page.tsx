import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Tag } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminTagsPage() {
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
    .select('*')
    .order('name');

  const allTags = (tags || []) as Tag[];

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
          Tags
        </h1>
      </div>

      {/* Tags List */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
      }}>
        {allTags.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {allTags.map(tag => (
              <div
                key={tag.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#F5F3EF',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <span style={{
                    display: 'inline-flex',
                    padding: '4px 12px',
                    background: '#7A9E7E',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '4px',
                  }}>
                    {tag.name}
                  </span>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    /{tag.slug}
                  </div>
                </div>
                <Link
                  href={`/tags/${tag.slug}`}
                  target="_blank"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    color: '#7A9E7E',
                    textDecoration: 'none',
                  }}
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏷️</div>
            <p>No tags yet</p>
          </div>
        )}
      </div>
    </div>
  );
}