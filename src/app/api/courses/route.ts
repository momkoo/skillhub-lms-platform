import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const instructorId = searchParams.get('instructor');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit') || '10';

    const supabase = await createClient();

    let query = supabase
        .from('skillhub_courses')
        .select(`
      *,
      instructor:skillhub_instructors(id, name, avatar_url, specialty),
      category:skillhub_categories(id, name, slug)
    `)
        .eq('is_published', true)
        .lte('published_at', new Date().toISOString()) // 예약된 강의 필터링
        .order('published_at', { ascending: false }) // 최신 공개순 정렬 (생성일 -> 공개일)
        .limit(parseInt(limit));

    if (category) {
        query = query.eq('category_id', category);
    }

    if (instructorId) {
        query = query.eq('instructor_id', instructorId);
    }

    if (featured === 'true') {
        query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
