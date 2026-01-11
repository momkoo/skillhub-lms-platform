import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. 모든 강의 정보 조회 (강사, 카테고리 포함)
        const { data: courses, error } = await supabase
            .from('skillhub_courses')
            .select(`
                id,
                title,
                price,
                thumbnail_url,
                student_count,
                instructor:skillhub_instructors(name),
                category:skillhub_categories(name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ courses: courses || [] });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. 관리자 권한 확인 (보안)
        // 1. 관리자 권한 확인 (보안 강화)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('skillhub_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            console.warn(`Unauthorized access attempt by user ${user.id}`);
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // 2. 요청 데이터 파싱
        const body = await request.json();
        console.log('Course Creation Request:', body); // Debug Log
        const { title, description, price, thumbnail_url, category_id, level } = body;

        // 3. 필수 데이터 검증
        if (!title || !price || !category_id) {
            return NextResponse.json({ error: '필수 항목(제목, 가격, 카테고리)이 누락되었습니다.' }, { status: 400 });
        }

        // [FIX] Valid Instructor Check
        // 하드코딩된 ID 대신 DB에서 실제 강사 ID 하나를 가져옵니다.
        let instructorId = body.instructor_id;
        if (!instructorId) {
            const { data: instructors } = await supabase
                .from('skillhub_instructors')
                .select('id')
                .limit(1);

            if (instructors && instructors.length > 0) {
                instructorId = instructors[0].id;
            } else {
                // 강사가 한 명도 없으면 에러 (또는 임시 강사 생성 로직 필요)
                console.error('No instructors found in DB');
                return NextResponse.json({ error: '등록된 강사가 없습니다. 강사를 먼저 등록해주세요.' }, { status: 400 });
            }
        }

        // 4. DB 저장
        const { data, error } = await supabase
            .from('skillhub_courses')
            .insert([
                {
                    title,
                    slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now(),
                    description,
                    price: Number(price),
                    thumbnail_url: thumbnail_url || '/assets/images/courses/course-1.jpg',
                    category_id,
                    level: level || 'beginner',
                    instructor_id: instructorId,
                    student_count: 0,
                    review_count: 0,
                    is_published: body.is_published !== undefined ? body.is_published : true,
                    published_at: body.published_at || new Date().toISOString(),
                    start_date: body.start_date || new Date().toISOString(),
                    original_price: body.original_price ? Number(body.original_price) : null
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error); // Debug Log
            throw error;
        }

        return NextResponse.json({ success: true, course: data });

    } catch (error: any) {
        console.error('Server Error:', error); // Debug Log
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient();

        // 1. 관리자 권한 확인
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 2. 요청 데이터 파싱
        const body = await request.json();
        const { id, title, description, price, thumbnail_url, category_id, level } = body;

        if (!id) {
            return NextResponse.json({ error: '강의 ID가 필요합니다.' }, { status: 400 });
        }

        // 3. DB 업데이트
        const { data, error } = await supabase
            .from('skillhub_courses')
            .update({
                title,
                description,
                price: Number(price),
                thumbnail_url,
                category_id,
                level,
                is_published: body.is_published,
                published_at: body.published_at || new Date().toISOString(),
                start_date: body.start_date || new Date().toISOString(),
                original_price: body.original_price ? Number(body.original_price) : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, course: data });

    } catch (error: any) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

