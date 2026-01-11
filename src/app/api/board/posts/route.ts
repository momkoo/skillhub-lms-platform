import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { checkRequestSecurity } from '@/lib/securityMiddleware';
import { validateTitle, validateContent, sanitizeText } from '@/lib/validation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    let query = supabase
        .from('skillhub_board_posts')
        .select(`
            *,
            category:skillhub_board_categories(id, name, slug, color),
            author:skillhub_profiles(id, nickname, avatar_url)
        `)
        .eq('status', 'published')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    if (search) {
        // 검색어 정제
        const sanitizedSearch = sanitizeText(search, 100);
        query = query.or(`title.ilike.%${sanitizedSearch}%,content.ilike.%${sanitizedSearch}%`);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    // 🔒 보안 검사: IP 차단 여부 및 의심스러운 요청 감지
    const securityCheck = await checkRequestSecurity(request);
    if (!securityCheck.passed) {
        return securityCheck.response;
    }

    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category_id, excerpt, thumbnail_url, password } = body;

    // 🔒 입력 검증
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
        return NextResponse.json({ error: titleValidation.error }, { status: 400 });
    }

    const contentValidation = validateContent(content, 50000);
    if (!contentValidation.valid) {
        return NextResponse.json({ error: contentValidation.error }, { status: 400 });
    }

    // 🔒 입력 정제
    const sanitizedTitle = sanitizeText(title, 200);
    const sanitizedExcerpt = excerpt ? sanitizeText(excerpt, 500) : null;

    // 1. 카테고리 정보 조회 (권한 체크용)
    const { data: category } = await supabase
        .from('skillhub_board_categories')
        .select('slug')
        .eq('id', category_id)
        .single();

    // 2. 유저 권한 조회
    const { data: profile } = await supabase
        .from('skillhub_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // 3. 카테고리별 작성 제한 로직
    // '공지사항(notice)'은 관리자만 작성 가능
    if (category?.slug === 'notice' && profile?.role !== 'admin') {
        return NextResponse.json({ error: '공지사항은 관리자만 작성할 수 있습니다.' }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('skillhub_board_posts')
        .insert({
            title,
            content,
            category_id,
            excerpt,
            thumbnail_url,
            password,
            author_id: user.id,
            status: 'published', // 기본값
            published_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 캐시 갱신 (목록 및 상세 페이지)
    revalidatePath('/community');

    return NextResponse.json(data);
}
