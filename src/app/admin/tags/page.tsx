'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    setTags(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Delete tag "${tag.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(tag.id);
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tag.id);

      if (error) throw error;

      // Remove from local state
      setTags(prev => prev.filter(t => t.id !== tag.id));
    } catch (err: any) {
      alert('Failed to delete tag: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

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
        {loading ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>Loading...</p>
        ) : tags.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {tags.map(tag => (
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => window.open(`/tags/${tag.slug}`, '_blank')}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#7A9E7E',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    View →
                  </button>
                  <button
                    onClick={() => handleDelete(tag)}
                    disabled={deleting === tag.id}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#DC2626',
                      background: 'none',
                      border: 'none',
                      cursor: deleting === tag.id ? 'wait' : 'pointer',
                      opacity: deleting === tag.id ? 0.5 : 1,
                    }}
                  >
                    {deleting === tag.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
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