import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { courseId } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 1. 이미 수강 중인지 확인
        const { data: existing } = await supabase
            .from('skillhub_enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single();

        if (existing) {
            return NextResponse.json({ error: '이미 수강 중인 강의입니다.' }, { status: 400 });
        }

        // 2. 수강 등록
        const { error } = await supabase
            .from('skillhub_enrollments')
            .insert({
                user_id: user.id,
                course_id: courseId,
                status: 'active'
            });

        if (error) throw error;

        // 3. 수강생 수 증가
        await supabase.rpc('increment_course_student_count', { course_uuid: courseId });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
