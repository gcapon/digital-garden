'use client';

import { useRef, useState, useEffect } from 'react';
import { slugify } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder = 'Write your note in markdown...' }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(value.length);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const wrapSelection = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);

    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newValue = value.substring(0, start) + text + value.substring(start);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      insertAtCursor(`[link text](${url})`);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      insertAtCursor(`![alt text](${url})`);
    }
  };

  const insertNoteLink = () => {
    const title = prompt('Enter note title (for [[Note Title]] link):');
    if (title) {
      insertAtCursor(`[[${title}]]`);
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(300, textarea.scrollHeight) + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [value]);

  const toolbarButtons = [
    { label: 'B', action: () => wrapSelection('**'), title: 'Bold (Ctrl+B)' },
    { label: 'I', action: () => wrapSelection('*'), title: 'Italic (Ctrl+I)' },
    { label: '🔗', action: insertLink, title: 'Insert Link' },
    { label: '🖼', action: insertImage, title: 'Insert Image' },
    { label: '</>', action: () => wrapSelection('`'), title: 'Code' },
    { label: '[[]]', action: insertNoteLink, title: 'Link to Note' },
  ];

  return (
    <div style={{
      border: '1.5px solid #E0DDD8',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#FFFFFF',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 12px',
        borderBottom: '1px solid #E0DDD8',
        background: '#FAFAF8',
      }}>
        {toolbarButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            title={btn.title}
            style={{
              padding: '6px 10px',
              fontSize: '13px',
              fontWeight: 600,
              background: '#FFFFFF',
              border: '1px solid #E0DDD8',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              minWidth: '32px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7A9E7E';
              e.currentTarget.style.color = '#7A9E7E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E0DDD8';
              e.currentTarget.style.color = '#2D2A24';
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onInput={autoResize}
        style={{
          width: '100%',
          minHeight: '300px',
          padding: '16px',
          border: 'none',
          fontSize: '15px',
          fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
          lineHeight: 1.6,
          color: '#2D2A24',
          resize: 'vertical',
          outline: 'none',
        }}
      />

      {/* Character count */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid #E0DDD8',
        fontSize: '12px',
        color: '#999',
        textAlign: 'right',
        background: '#FAFAF8',
      }}>
        {charCount.toLocaleString()} characters
      </div>
    </div>
  );
}