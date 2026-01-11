import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('skillhub_reviews')
        .select(`
            *,
            author:skillhub_profiles(id, nickname, avatar_url)
        `)
        .eq('course_id', id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { rating, content } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: '1~5점 사이의 평점을 선택해주세요.' }, { status: 400 });
    }

    // 2. 수강 여부 확인 (Optional: 정책에 따라 구매한 사람만 가능하게 할지 결정)
    // 여기서는 구매 이력이 있는지 확인하는 로직 추가
    const { data: enrollment } = await supabase
        .from('skillhub_enrollments')
        .select('id')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .single();

    if (!enrollment) {
        return NextResponse.json({ error: '강의를 수강 중인 학생만 후기를 남길 수 있습니다.' }, { status: 403 });
    }

    // 3. 후기 작성/업데이트 (Upsert)
    const { data, error } = await supabase
        .from('skillhub_reviews')
        .upsert({
            course_id: id,
            user_id: user.id,
            rating,
            content,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,course_id'
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
