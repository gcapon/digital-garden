import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { GraphVisualization } from '@/components/GraphVisualization';
import { Note } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminGraphPage() {
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
    .order('created_at', { ascending: false });

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
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D2A24' }}>
            Graph View
          </h1>
          <p style={{ color: '#999', fontSize: '14px', marginTop: '4px' }}>
            Visualize connections between your notes
          </p>
        </div>
      </div>

      {/* Graph */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
        overflow: 'hidden',
      }}>
        <div style={{ height: '600px' }}>
          <GraphVisualization notes={allNotes} />
        </div>
      </div>
    </div>
  );
}