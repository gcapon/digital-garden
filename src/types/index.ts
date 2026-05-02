export interface Note {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  status: 'draft' | 'published';
  user_id: string;
  created_at: string;
  updated_at: string;
  // tags comes from Supabase join - can be NoteTag[] or Tag[] depending on query
  tags?: any[];
}

// Supabase returns tags in a nested format via the join table
export interface NoteTag {
  tag: Tag;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface NoteLink {
  from_note_id: string;
  to_note_id: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
}

export interface GraphNode {
  id: string;
  title: string;
  slug: string;
  x: number;
  y: number;
  connections: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
}