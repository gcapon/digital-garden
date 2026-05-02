import { supabaseAdmin } from './supabase-server';
import { slugify } from './utils';
import { parseLinks } from './markdown';
import { NoteLink } from '@/types';

// Update note_links table based on content's [[...]] references
export async function updateNoteLinks(
  noteId: string,
  content: string
): Promise<void> {
  // Parse all [[links]] from content
  const linkTitles = parseLinks(content);

  // Find target note IDs for each link
  const targetIds: string[] = [];
  for (const title of linkTitles) {
    const slug = slugify(title);
    const { data: note } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('slug', slug)
      .single();

    if (note) {
      targetIds.push(note.id);
    }
  }

  // Get current links
  const { data: currentLinks } = await supabaseAdmin
    .from('note_links')
    .select('to_note_id')
    .eq('from_note_id', noteId);

  const currentTargetIds = currentLinks?.map(l => l.to_note_id) || [];

  // Delete links that no longer exist
  const toDelete = currentTargetIds.filter(id => !targetIds.includes(id));
  if (toDelete.length > 0) {
    await supabaseAdmin
      .from('note_links')
      .delete()
      .eq('from_note_id', noteId)
      .in('to_note_id', toDelete);
  }

  // Add new links (ignore duplicates - they just won't insert)
  const toAdd = targetIds.filter(id => !currentTargetIds.includes(id));
  for (const targetId of toAdd) {
    if (targetId !== noteId) { // Don't link to self
      try {
        await supabaseAdmin
          .from('note_links')
          .insert({ from_note_id: noteId, to_note_id: targetId });
      } catch (err) {
        // Ignore duplicate key errors - link already exists
      }
    }
  }
}

// Get all notes that link TO a specific note (backlinks)
export async function getBacklinks(noteId: string): Promise<{ from_note_id: string }[]> {
  const { data, error } = await supabaseAdmin
    .from('note_links')
    .select('from_note_id')
    .eq('to_note_id', noteId);

  if (error) {
    console.error('Error fetching backlinks:', error);
    return [];
  }

  return data || [];
}

// Get all links from a specific note
export async function getOutgoingLinks(noteId: string): Promise<{ to_note_id: string }[]> {
  const { data, error } = await supabaseAdmin
    .from('note_links')
    .select('to_note_id')
    .eq('from_note_id', noteId);

  if (error) {
    console.error('Error fetching outgoing links:', error);
    return [];
  }

  return data || [];
}

// Check if a note exists by title
export async function noteExistsByTitle(title: string): Promise<boolean> {
  const slug = slugify(title);
  const { data } = await supabaseAdmin
    .from('notes')
    .select('id')
    .eq('slug', slug)
    .single();

  return !!data;
}