'use client';

import Link from 'next/link';
import { Note, Tag, NoteTag } from '@/types';
import { formatDate } from '@/lib/utils';
import { TagPill } from './TagPill';

interface NoteCardProps {
  note: Note;
  featured?: boolean;
}

// Helper to get tags in various formats from Supabase join
export function getTagsFromNote(note: Note): Tag[] {
  if (!note.tags || !Array.isArray(note.tags) || note.tags.length === 0) return [];
  
  const firstTag = note.tags[0];
  
  // If tags are string[] (text[] column), return as Tag[]
  if (typeof firstTag === 'string') {
    return (note.tags as string[]).map(name => ({
      id: name,
      name: name,
      slug: name,
      created_at: ''
    }));
  }
  
  // If tags are NoteTag[] (from Supabase join), extract the tag
  if (firstTag && typeof firstTag === 'object' && 'tag' in firstTag) {
    return (note.tags as NoteTag[])
      .filter(nt => Boolean(nt) && Boolean(nt.tag))
      .map(nt => nt.tag)
      .filter(tag => Boolean(tag) && Boolean(tag.id));
  }
  
  // Otherwise assume it's already Tag[]
  return (note.tags as Tag[]).filter(tag => Boolean(tag) && Boolean(tag.id));
}

export function NoteCard({ note, featured = false }: NoteCardProps) {
  const tags = getTagsFromNote(note);
  const displayTags = tags.slice(0, 3);
  const extraTags = tags.length - 3;

  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(45, 42, 36, 0.08)',
    transition: 'all 200ms ease',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    height: '100%',
  };

  const hoverStyle = `
    .note-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45, 42, 36, 0.12);
    }
  `;

  return (
    <>
      <style>{hoverStyle}</style>
      <Link href={`/garden/${note.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <article className="note-card" style={cardStyle}>
          {note.featured_image && (
            <div style={{
              height: featured ? 220 : 160,
              backgroundImage: `url(${note.featured_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
          )}
          <div style={{ padding: '20px' }}>
            <h3 style={{
              fontSize: featured ? '22px' : '18px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#2D2A24',
              lineHeight: 1.3,
            }}>
              {note.title}
            </h3>
            {note.excerpt && (
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '12px',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: featured ? 3 : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {note.excerpt}
              </p>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
            }}>
              <span style={{ fontSize: '13px', color: '#999' }}>
                {formatDate(note.created_at)}
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {displayTags.map(tag => (
                  <TagPill key={tag.id || tag.name} tag={tag} />
                ))}
                {extraTags > 0 && (
                  <span style={{
                    fontSize: '12px',
                    color: '#999',
                    padding: '4px 8px',
                  }}>
                    +{extraTags}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    </>
  );
}