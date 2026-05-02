'use client';

import Link from 'next/link';
import { Tag } from '@/types';

interface TagPillProps {
  tag: Tag;
  variant?: 'default' | 'active' | 'selected';
  clickable?: boolean;
}

export function TagPill({ tag, variant = 'default', clickable = true }: TagPillProps) {
  const variants = {
    default: { background: '#7A9E7E', color: '#FFFFFF' },
    active: { background: '#C67B5D', color: '#FFFFFF' },
    selected: { background: '#7A9E7E', color: '#FFFFFF' },
  };

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '9999px',
    transition: 'all 150ms ease',
    background: variants[variant].background,
    color: variants[variant].color,
  };

  if (clickable) {
    return (
      <Link href={`/tags/${tag.slug}`} style={{ textDecoration: 'none' }}>
        <span style={style}>{tag.name}</span>
      </Link>
    );
  }

  return <span style={style}>{tag.name}</span>;
}