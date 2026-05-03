import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { slugify } from '@/lib/utils';
import { extractExcerpt } from '@/lib/markdown';
import { updateNoteLinks } from '@/lib/links';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Only return published notes to public
    if (note.status !== 'published') {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Get backlinks
    const { data: links } = await supabase
      .from('note_links')
      .select('from_note_id')
      .eq('to_note_id', note.id);

    const backlinkIds = links?.map(l => l.from_note_id) || [];
    let backlinks: any[] = [];

    if (backlinkIds.length > 0) {
      const { data: linkedNotes } = await supabase
        .from('notes')
        .select('id, title, slug, excerpt')
        .in('id', backlinkIds)
        .eq('status', 'published');
      backlinks = linkedNotes || [];
    }

    return NextResponse.json({ note, backlinks });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, status, tags, featured_image } = body;

    // Get existing note
    const { data: existing } = await supabase
      .from('notes')
      .select('id, user_id')
      .eq('slug', slug)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Check ownership
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = slugify(title);
    }
    if (content !== undefined) {
      updateData.content = content;
      updateData.excerpt = extractExcerpt(content);
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (featured_image !== undefined) {
      updateData.featured_image = featured_image;
    }
    updateData.updated_at = new Date().toISOString();

    const { data: note, error: updateError } = await supabase
      .from('notes')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update tags if provided
    if (tags !== undefined) {
      const tagNames = tags.map((t: string) => t.trim()).filter(Boolean);

      // Update the tags array on the notes table
      await supabase
        .from('notes')
        .update({ tags: tagNames })
        .eq('id', note.id);

      // Also ensure all tags exist in the tags table
      for (const tagName of tagNames) {
        const tagSlug = slugify(tagName);
        let { data: tag } = await supabase
          .from('tags')
          .select('id, name, slug')
          .eq('slug', tagSlug)
          .single();

        if (!tag) {
          await supabase
            .from('tags')
            .insert({ name: tagName, slug: tagSlug });
        }
      }
    }

    // Update note links if content changed
    if (content !== undefined) {
      await updateNoteLinks(note.id, content);
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing note
    const { data: existing } = await supabase
      .from('notes')
      .select('id, user_id')
      .eq('slug', slug)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Check ownership
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await supabase.from('notes').delete().eq('slug', slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}