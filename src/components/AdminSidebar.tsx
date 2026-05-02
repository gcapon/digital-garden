'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  userEmail?: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/notes', label: 'All Notes', icon: '✏️' },
    { href: '/admin/notes/new', label: 'New Note', icon: '➕' },
    { href: '/admin/tags', label: 'Tags', icon: '🏷️' },
    { href: '/admin/graph', label: 'Graph View', icon: '🌐' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: '#1A1A1A',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #333',
      }}>
        <Link href="/admin" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#E8E6E1',
          textDecoration: 'none',
        }}>
          🌿 Garden Admin
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#7A9E7E' : '#A0A0A0',
                background: isActive ? 'rgba(122, 158, 126, 0.15)' : 'transparent',
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

      {/* User / Logout */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #333',
      }}>
        {userEmail && (
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {userEmail}
          </div>
        )}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#A0A0A0',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#E8E6E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#A0A0A0';
            }}
          >
            🚪 Logout
          </button>
        </form>
      </div>
    </aside>
  );
}