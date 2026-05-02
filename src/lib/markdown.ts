import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { slugify } from './utils';

// Extract [[...]] link titles from content
export function parseLinks(content: string): string[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

// Convert markdown content to HTML with [[bidirectional links]] resolved
export async function renderMarkdown(
  content: string,
  notesMap: Map<string, { slug: string; exists: boolean }> = new Map()
): Promise<string> {
  // First, replace [[Note Title]] with special placeholder syntax
  let processed = content.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
    const slug = slugify(title.trim());
    return `[${title.trim()}](/garden/${slug}){.internal-link}`;
  });

  // Also handle missing links (notes that don't exist yet)
  processed = processed.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
    const slug = slugify(title.trim());
    return `[${title.trim()}](/garden/${slug}?new=1)]`;
  });

  const result = await remark()
    .use(remarkGfm)
    .process(processed);

  let html = String(result);

  // Post-process to add proper classes to internal links
  html = html.replace(
    /href="\/garden\/([^"]+)"/g,
    (match, slug) => {
      // Check if we know this note exists
      return match;
    }
  );

  return html;
}

// Simple sync markdown rendering (for client-side)
export function renderMarkdownSync(content: string): string {
  // Escape HTML first
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Process [[links]] first - replace with placeholder
  html = html.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
    const slug = slugify(title.trim());
    return `<a href="/garden/${slug}" class="internal-link">${title.trim()}</a>`;
  });

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/, '<ul>$1</ul>');
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  // Paragraphs (simple: double newline = paragraph)
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<img)/g, '$1');
  html = html.replace(/(<img[^>]+>)<\/p>/g, '$1');

  return html;
}

// Extract plain text excerpt from markdown content
export function extractExcerpt(content: string, length = 120): string {
  // Remove [[links]]
  let text = content.replace(/\[\[([^\]]+)\]\]/g, '$1');
  // Remove markdown syntax
  text = text.replace(/[*_`#>\[\]!]/g, '');
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  // Truncate
  if (text.length > length) {
    text = text.substring(0, length).trim() + '...';
  }
  return text;
}