import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. 관리자 권한 확인 (생략 가능하나 보안상 권장)
        const { data: { user } } = await supabase.auth.getUser();
        // if (!user || user.user_metadata?.role !== 'admin') {
        //     return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        // }

        // 2. 통계 데이터 조회
        // 회원 수 (auth.users는 직접 조회가 제한될 수 있으므로 Profiles 테이블이 있다면 거기서 조회 권장)
        // 여기서는 간단히 enrollments와 courses 위주로 집계

        const { count: userCount } = await supabase
            .from('skillhub_enrollments')
            .select('*', { count: 'exact', head: true }); // 임시로 수강생 수 기준

        const { count: courseCount } = await supabase
            .from('skillhub_courses')
            .select('*', { count: 'exact', head: true });

        const { count: enrollmentCount } = await supabase
            .from('skillhub_enrollments')
            .select('*', { count: 'exact', head: true });

        // 매출액 합산 (paid 상태인 결제 내역)
        const { data: payments } = await supabase
            .from('skillhub_payments')
            .select('amount')
            .eq('status', 'paid');

        const totalRevenue = payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

        return NextResponse.json({
            totalUsers: userCount || 0,
            totalCourses: courseCount || 0,
            totalEnrollments: enrollmentCount || 0,
            totalRevenue: totalRevenue
        });

    } catch (error: any) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
