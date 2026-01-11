import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('skillhub_board_comments')
        .select(`
            *,
            author:skillhub_profiles(id, nickname, avatar_url)
        `)
        .eq('post_id', id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { content, parent_id } = await request.json();

    if (!content) {
        return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('skillhub_board_comments')
        .insert({
            post_id: id,
            user_id: user.id,
            content,
            parent_id
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment comment count on post
    await supabase.rpc('increment_board_post_comment_count', { post_uuid: id });

    return NextResponse.json(data);
}
