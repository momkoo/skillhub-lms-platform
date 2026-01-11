import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin'; // 추가
import { NextResponse } from 'next/server';

/**
 * 결제 검증 API (Verify)
 * 사용 이유: 프론트엔드 가격 변조 방지 및 결제 완료 여부 서버 최종 확인
 */
export async function POST(request: Request) {
    try {
        const { paymentId, merchantUid } = await request.json();

        // Admin 클라이언트 생성 (RLS 우회 - 확실한 상태 업데이트를 위해)
        const supabaseAdmin = createAdminClient();

        // 1. DB에서 결제 준비 정보 가져오기 (Expected Data)
        // Admin 권한으로 조회 (User RLS 무관하게 조회)
        const { data: prePayment, error: preError } = await supabaseAdmin
            .from('skillhub_payments')
            .select('*')
            .eq('merchant_uid', merchantUid)
            .single();

        if (preError || !prePayment) {
            return NextResponse.json({ error: '유효하지 않은 주문 번호입니다.' }, { status: 400 });
        }

        // 이미 처리된 결제라면 성공 응답 (중복 처리 방지 - Idempotency)
        if (prePayment.status === 'paid') {
            return NextResponse.json({ success: true, message: "이미 처리된 결제입니다." });
        }

        // 2. 포트원 서버에서 실제 결제 내역 조회 (Actual Data)
        const portOneResponse = await fetch(
            `https://api.portone.io/payments/${paymentId}`,
            {
                headers: {
                    Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!portOneResponse.ok) {
            throw new Error("포트원 결제 정보 조회 실패");
        }

        const portOneData = await portOneResponse.json();

        // 3. 2중 교차 검사 (Dual-Checksum)
        // A. 결제 상태 확인
        if (portOneData.status !== "PAID") {
            return NextResponse.json({ error: '결제가 완료되지 않았습니다.' }, { status: 400 });
        }

        // B. 결제 금액 위변조 확인 (DB에 저장된 금액 vs 포트원 금액)
        if (portOneData.amount.total !== prePayment.amount) {
            console.error(`Pricematching failed! Expected: ${prePayment.amount}, Actual: ${portOneData.amount.total}`);
            return NextResponse.json({ error: '결제 금액이 일치하지 않습니다. (보안 위협 감지)' }, { status: 400 });
        }

        // 4. 결제 완료 처리 (DB Transactional Update) - Admin 권한 사용
        const { error: updateError } = await supabaseAdmin
            .from('skillhub_payments')
            .update({
                payment_id: paymentId,
                status: 'paid',
                payment_method: portOneData.method?.type || 'card',
                paid_at: portOneData.paidAt || new Date().toISOString()
            })
            .eq('merchant_uid', merchantUid);

        if (updateError) throw updateError;

        // 5. 수강권 발급 (Enrollment) - Admin 권한 사용
        const { error: enrollmentError } = await supabaseAdmin
            .from('skillhub_enrollments')
            .upsert({
                user_id: prePayment.user_id,
                course_id: prePayment.course_id,
                status: 'active'
            }, {
                onConflict: 'user_id, course_id' // 명시적 충돌 타겟 지정
            });

        if (enrollmentError) {
            // 이미 Webhook 등에서 처리되어 중복 에러가 날 경우 무시 (Race Conditon 처리)
            if (enrollmentError.code === '23505') {
                console.log('Enrollment already exists (Race condition handled).');
            } else {
                throw enrollmentError;
            }
        }

        // 6. 강의 조회수/수강생수 증가 등 사후 처리 (비동기 rpc 추천)
        await supabaseAdmin.rpc('increment_course_student_count', { course_uuid: prePayment.course_id });

        return NextResponse.json({
            success: true,
            message: "결제와 수강권 발급이 안전하게 완료되었습니다."
        });

    } catch (error: any) {
        console.error("Payment Verification Failed:", error);
        return NextResponse.json(
            { error: '서버 내부 오류로 결제 검증에 실패했습니다.' },
            { status: 500 }
        );
    }
}
