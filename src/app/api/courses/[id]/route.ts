import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const supabase = await createClient();

    // Detect if the id is a UUID or a slug
    const isUUID = UUID_REGEX.test(id);

    let query = supabase
        .from('skillhub_courses')
        .select(`
      *,
      instructor:skillhub_instructors(*),
      category:skillhub_categories(id, name, slug),
      lessons:skillhub_lessons(
        id, title, description, section_title, section_order, 
        order_index, duration_minutes, is_free
      )
    `);

    // Query by UUID or slug
    if (isUUID) {
        query = query.eq('id', id);
    } else {
        query = query.eq('slug', id);
    }

    const { data, error } = await query.single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // 강의 조회수 증가 (비동기 처리)
    supabase.rpc('increment_course_view_count', { course_uuid: data.id }).then(() => { });

    return NextResponse.json(data);
}
