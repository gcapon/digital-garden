'use client';

import Link from 'next/link';
import { Note } from '@/types';

interface BacklinkPanelProps {
  backlinks: Note[];
}

export function BacklinkPanel({ backlinks }: BacklinkPanelProps) {
  if (backlinks.length === 0) {
    return (
      <div style={{
        padding: '24px',
        background: '#F5F3EF',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px',
      }}>
        No other notes link to this one yet.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#2D2A24',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        📎 Linked to from {backlinks.length} {backlinks.length === 1 ? 'note' : 'notes'}
      </h3>
      <div style={{
        display: 'grid',
        gap: '12px',
      }}>
        {backlinks.map(note => (
          <Link
            key={note.id}
            href={`/garden/${note.slug}`}
            style={{
              display: 'block',
              padding: '16px',
              background: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E8E6E1',
              textDecoration: 'none',
              transition: 'all 200ms ease',
            }}
          >
            <h4 style={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#2D2A24',
              marginBottom: '6px',
            }}>
              {note.title}
            </h4>
            {note.excerpt && (
              <p style={{
                fontSize: '13px',
                color: '#666',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {note.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}