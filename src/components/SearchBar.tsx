'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/types';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (slug: string) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    router.push(`/garden/${slug}`);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '300px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#F0EDE8',
        borderRadius: '8px',
        padding: '0 12px',
      }}>
        <span style={{ fontSize: '16px', marginRight: '8px' }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '10px 0',
            fontSize: '14px',
            color: '#2D2A24',
            outline: 'none',
          }}
        />
        {isLoading && (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTopColor: '#7A9E7E',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(45, 42, 36, 0.12)',
          zIndex: 100,
          maxHeight: '320px',
          overflowY: 'auto',
        }}>
          {results.map(result => (
            <button
              key={result.id}
              onClick={() => handleSelect(result.slug)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #F0EDE8',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F5F3EF'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#2D2A24',
                marginBottom: '4px',
              }}>
                {result.title}
              </div>
              {result.excerpt && (
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {result.excerpt}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && !isLoading && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(45, 42, 36, 0.12)',
          zIndex: 100,
          padding: '16px',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px',
        }}>
          No notes found for "{query}"
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}