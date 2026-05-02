'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EditNotePage({ params }: PageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [tagsInput, setTagsInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchNote = async () => {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        setTitle(data.title || '');
        setContent(data.content || '');
        setStatus(data.status || 'draft');
        setFeaturedImage(data.featured_image || '');

        // Fetch tags
        const { data: noteTags } = await supabase
          .from('note_tags')
          .select('tag:tags(name)')
          .eq('note_id', data.id);

        if (noteTags) {
          const tagNames = noteTags.map((nt: any) => nt.tag?.name).filter(Boolean);
          setTagsInput(tagNames.join(', '));
        }
      }
    };

    fetchNote();
  }, [slug]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    setSaveMessage('Saving...');

    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      // Update note
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          title: title.trim(),
          content: content.trim(),
          status,
          featured_image: featuredImage || null,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', slug);

      if (updateError) throw updateError;

      // Get note ID
      const { data: note } = await supabase
        .from('notes')
        .select('id')
        .eq('slug', slug)
        .single();

      if (note) {
        // Delete existing tags
        await supabase.from('note_tags').delete().eq('note_id', note.id);

        // Add new tags
        for (const tagName of tags) {
          const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          let { data: tag } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', tagSlug)
            .single();

          if (!tag) {
            const { data: newTag } = await supabase
              .from('tags')
              .insert({ name: tagName, slug: tagSlug })
              .select('id')
              .single();
            tag = newTag;
          }

          if (tag) {
            await supabase
              .from('note_tags')
              .insert({ note_id: note.id, tag_id: tag.id });
          }
        }
      }

      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err: any) {
      setSaveMessage('');
      alert(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('slug', slug);

      if (error) throw error;

      router.push('/admin/notes');
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
      setIsDeleting(false);
    }
  };

  if (!slug) {
    return <div>Loading...</div>;
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <Link
              href="/admin/notes"
              style={{
                fontSize: '14px',
                color: '#999',
                textDecoration: 'none',
              }}
            >
              ← All Notes
            </Link>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D2A24' }}>
            Edit Note
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {saveMessage && (
            <span style={{ fontSize: '14px', color: '#7A9E7E' }}>{saveMessage}</span>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              color: '#DC2626',
              background: 'transparent',
              border: '1px solid #DC2626',
              borderRadius: '8px',
              cursor: isDeleting ? 'wait' : 'pointer',
              opacity: isDeleting ? 0.7 : 1,
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              background: '#7A9E7E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isSaving ? 'wait' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Editor */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '24px',
                fontWeight: 600,
                border: '2px solid #E8E6E1',
                borderRadius: '12px',
                outline: 'none',
                color: '#2D2A24',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#666', marginBottom: '8px' }}>
              Featured Image URL (optional)
            </label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: '1.5px solid #E0DDD8',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#666', marginBottom: '8px' }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note using Markdown. Use [[Note Title]] to link to other notes."
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '16px',
                fontSize: '15px',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                lineHeight: 1.6,
                border: '1.5px solid #E0DDD8',
                borderRadius: '12px',
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              Use [[Note Title]] to create links to other notes
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Status */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
          }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#2D2A24', marginBottom: '12px' }}>
              Status
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setStatus('draft')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: status === 'draft' ? '#FEF3C7' : '#F5F3EF',
                  color: status === 'draft' ? '#92400E' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Draft
              </button>
              <button
                onClick={() => setStatus('published')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: status === 'published' ? '#D1FAE5' : '#F5F3EF',
                  color: status === 'published' ? '#065F46' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Published
              </button>
            </div>
          </div>

          {/* Tags */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
          }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#2D2A24', marginBottom: '12px' }}>
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '1.5px solid #E0DDD8',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              Separate tags with commas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}