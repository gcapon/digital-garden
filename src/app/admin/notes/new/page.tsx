'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [tagsInput, setTagsInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    setSaveMessage('Saving...');

    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: title.trim(),
          content: content.trim(),
          status,
          tags,
          featured_image: featuredImage || null,
        })
        .select()
        .single();

      if (error) throw error;

      setSaveMessage('Saved!');
      setTimeout(() => {
        router.push(`/admin/notes/${data.slug}/edit`);
      }, 500);
    } catch (err: any) {
      setSaveMessage('');
      alert(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
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
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2D2A24' }}>
            New Note
          </h1>
          <p style={{ color: '#999', fontSize: '14px', marginTop: '4px' }}>
            Create a new note in your garden
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/admin/notes"
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              color: '#666',
              textDecoration: 'none',
            }}
          >
            Cancel
          </Link>
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
            {saveMessage || 'Save Note'}
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