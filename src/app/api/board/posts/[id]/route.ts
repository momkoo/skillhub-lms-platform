import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('skillhub_board_posts')
        .select(`
            *,
            category:skillhub_board_categories(id, name, slug, color),
            author:skillhub_profiles(id, nickname, avatar_url)
        `)
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment view count using the RPC function we defined in schema
    await supabase.rpc('increment_board_post_view_count', { post_uuid: id });

    return NextResponse.json(data);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. 토큰 검증 (Every request check)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { password, ...updateData } = await request.json();

    // 2. 권한 및 작성자 확인 + 관리자 바이패스
    const { data: post, error: fetchError } = await supabase
        .from('skillhub_board_posts')
        .select('author_id, password')
        .eq('id', id)
        .single();

    if (fetchError || !post) {
        return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 유저 프로필에서 role 가져오기 (관리자 확인용)
    const { data: profile } = await supabase
        .from('skillhub_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.role === 'admin';
    const isAuthor = post.author_id === user.id;

    if (!isAdmin && !isAuthor) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 3. 게시글 비밀번호 확인 (관리자가 아닐 경우에만 필수로 체크)
    if (!isAdmin && post.password) {
        // pgcrypto crypt() 함수를 사용하여 DB 레벨에서 검증
        const { data: isValid, error: verifyError } = await supabase
            .rpc('verify_board_post_password', {
                post_uuid: id,
                input_password: password
            });

        if (verifyError || !isValid) {
            return NextResponse.json({ error: '게시글 비밀번호가 일치하지 않습니다.' }, { status: 403 });
        }
    }

    const { data, error } = await supabase
        .from('skillhub_board_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/community');
    revalidatePath(`/community/${id}`);

    return NextResponse.json(data);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { password } = await request.json();
    const supabase = await createClient();

    // 1. 토큰 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 2. 작성자 및 권한 확인
    const { data: post, error: fetchError } = await supabase
        .from('skillhub_board_posts')
        .select('author_id, password')
        .eq('id', id)
        .single();

    if (fetchError || !post) {
        return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const { data: profile } = await supabase
        .from('skillhub_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.role === 'admin';
    const isAuthor = post.author_id === user.id;

    if (!isAdmin && !isAuthor) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 3. 비밀번호 확인
    if (!isAdmin && post.password) {
        const { data: isValid, error: verifyError } = await supabase
            .rpc('verify_board_post_password', {
                post_uuid: id,
                input_password: password
            });

        if (verifyError || !isValid) {
            return NextResponse.json({ error: '게시글 비밀번호가 일치하지 않습니다.' }, { status: 403 });
        }
    }

    // Soft delete
    const { error } = await supabase
        .from('skillhub_board_posts')
        .update({ is_deleted: true })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/community');

    return NextResponse.json({ success: true });
}
