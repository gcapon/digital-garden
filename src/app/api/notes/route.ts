import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { slugify } from '@/lib/utils';
import { extractExcerpt } from '@/lib/markdown';
import { updateNoteLinks } from '@/lib/links';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    const { data: notes, error } = await supabase
      .from('notes')
      .select(`
        *,
        tags:note_tags(tag:id, name, slug)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    const { title, content, status = 'draft', tags = [], featured_image } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const slug = slugify(title);
    const excerpt = extractExcerpt(content);

    // Create note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        title,
        slug,
        content,
        excerpt,
        status,
        featured_image,
        user_id: user.id,
      })
      .select()
      .single();

    if (noteError) {
      if (noteError.code === '23505') {
        return NextResponse.json({ error: 'A note with this title already exists' }, { status: 409 });
      }
      throw noteError;
    }

    // Handle tags
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      // Find or create tag
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tagSlug)
        .single();

      if (!tag) {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({ name: tagName, slug: tagSlug })
          .select('id')
          .single();
        tag = newTag;
      }

      if (tag) {
        await supabase
          .from('note_tags')
          .insert({ note_id: note.id, tag_id: tag.id });
      }
    }

    // Update note links
    await updateNoteLinks(note.id, content);

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}