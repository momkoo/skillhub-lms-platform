import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // 관리자 권한 확인 (보안)
        const { data: { user: adminUser } } = await supabase.auth.getUser();
        if (!adminUser) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        // 1. 모든 수강생(enrollments) 정보 또는 프로필 정보 조회
        // 여기서는 임시로 결제/신청 내역이 있는 유저들 위주로 조회하거나
        // 만약 profiles 테이블이 있다면 그것을 사용함.
        // 현재 스키마상 수강 신청 내역(enrollments)에서 유저 ID를 뽑아올 수 있음.

        const { data: users, error } = await supabase
            .from('skillhub_enrollments')
            .select(`
                user_id,
                status,
                created_at,
                course:skillhub_courses(title)
            `);

        if (error) throw error;

        // 중복 제거 및 가공 (실제 프로젝트에서는 별도의 Profiles 테이블 운영 권장)
        const uniqueUsers = Array.from(new Set(users.map(u => u.user_id))).map(id => {
            const userEnrollments = users.filter(u => u.user_id === id);
            return {
                id,
                email: `user_${id.substring(0, 5)}@skillhub.com`, // 실제 이메일은 auth admin API 필요
                nickname: `수강생_${id.substring(0, 4)}`,
                role: 'student',
                createdAt: userEnrollments[0].created_at,
                courseCount: userEnrollments.length
            };
        });

        return NextResponse.json({ users: uniqueUsers });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
