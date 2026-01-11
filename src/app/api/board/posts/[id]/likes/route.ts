import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

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

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
        .from('skillhub_board_likes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (checkError) {
        return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingLike) {
        // Unlike
        const { error: unlikeError } = await supabase
            .from('skillhub_board_likes')
            .delete()
            .eq('post_id', id)
            .eq('user_id', user.id);

        if (unlikeError) {
            return NextResponse.json({ error: unlikeError.message }, { status: 500 });
        }

        // Decrement like count
        await supabase.rpc('decrement_board_post_like_count', { post_uuid: id });

        revalidatePath('/community');
        revalidatePath(`/community/${id}`);

        return NextResponse.json({ liked: false });
    } else {
        // Like
        const { error: likeError } = await supabase
            .from('skillhub_board_likes')
            .insert({
                post_id: id,
                user_id: user.id
            });

        if (likeError) {
            return NextResponse.json({ error: likeError.message }, { status: 500 });
        }

        // Increment like count
        await supabase.rpc('increment_board_post_like_count', { post_uuid: id });

        revalidatePath('/community');
        revalidatePath(`/community/${id}`);

        return NextResponse.json({ liked: true });
    }
}
