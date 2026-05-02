'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraphVisualization } from './GraphVisualization';
import { Tag } from '@/types';
import { Note } from '@/types';

interface SidebarProps {
  tags?: Tag[];
  notes?: Note[];
}

export function Sidebar({ tags = [], notes = [] }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/garden', label: 'Home', icon: '🏠' },
    { href: '/tags', label: 'Tags', icon: '🏷️' },
    { href: '/graph', label: 'Graph', icon: '🕸️' },
  ];

  return (
    <aside style={{
      width: '260px',
      height: 'calc(100vh - 64px)',
      position: 'fixed',
      top: '64px',
      left: 0,
      background: '#FFFFFF',
      borderRight: '1px solid #E8E6E1',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Site Title */}
      <div style={{
        padding: '24px 20px 16px',
        borderBottom: '1px solid #F0EDE8',
      }}>
        <Link href="/garden" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '20px',
          fontWeight: 600,
          color: '#2D2A24',
          textDecoration: 'none',
        }}>
          🌿 Digital Garden
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#7A9E7E' : '#2D2A24',
                background: isActive ? '#F0EDE8' : 'transparent',
                textDecoration: 'none',
                marginBottom: '4px',
                transition: 'all 150ms ease',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Graph Visualization */}
      <div style={{
        flex: 1,
        padding: '0 12px',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '8px 12px 12px',
        }}>
          Knowledge Graph
        </h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <GraphVisualization notes={notes} compact />
        </div>
      </div>

      {/* Tag Cloud */}
      {tags.length > 0 && (
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid #F0EDE8',
        }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '0 12px 12px',
          }}>
            Tags
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            padding: '0 4px',
          }}>
            {tags.slice(0, 10).map(tag => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  background: '#F0EDE8',
                  borderRadius: '9999px',
                  color: '#2D2A24',
                  textDecoration: 'none',
                  transition: 'all 150ms ease',
                }}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}