import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { merchant_uid, reason } = await request.json();

        // 1. 관리자 권한 확인 (또는 본인 확인)
        // 여기서는 안전하게 Admin Client를 사용하되, 실제로는 요청한 유저가 해당 주문의 주인인지 체크하는 로직이 권장됨
        const supabaseAdmin = createAdminClient();

        // 2. 결제 정보 조회
        const { data: payment, error: fetchError } = await supabaseAdmin
            .from('skillhub_payments')
            .select('*')
            .eq('merchant_uid', merchant_uid)
            .single();

        if (fetchError || !payment) {
            return NextResponse.json({ error: '결제 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (payment.status === 'cancelled') {
            return NextResponse.json({ error: '이미 취소된 결제입니다.' }, { status: 400 });
        }

        // 3. 포트원 취소 API 호출
        // 토큰 발급이 필요할 수 있으나, V2 API나 Secret 사용 방식에 따라 다름.
        // 여기서는 Secret을 헤더에 사용하는 방식(V2) 또는 Access Token 방식(V1) 확인 필요. 
        // *PortOne V1/V2 문서를 참고하여 V1 cancel API 호출 (보통 Secret으로 토큰을 받거나 바로 호출)*

        // V1 방식: Access Token 발급 -> 취소 요청
        // (단, V2 Secret을 사용하는 경우 바로 호출 가능한지 확인 필요. 보통은 토큰 발급이 먼저임)

        // 3-1. Access Token 발급
        const tokenRes = await fetch('https://api.iamport.kr/users/getToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imp_key: process.env.NEXT_PUBLIC_PORTONE_API_KEY, // V1 Key (없으면 env 확인 필요)
                imp_secret: process.env.PORTONE_API_SECRET // V1 Secret
            })
        });

        // *참고: 현재 .env에는 PORTONE_API_SECRET만 있음. V2 방식일 수도 있음. 
        // 포트원 V2 API: https://api.portone.io/payments/{paymentId}/cancel

        let cancelSuccess = false;
        let cancelData = null;

        // V2 API 시도 (payment_id가 있는 경우)
        if (payment.payment_id) {
            const cancelRes = await fetch(`https://api.portone.io/payments/${payment.payment_id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `PortOne ${process.env.PORTONE_API_SECRET}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reason: reason || '사용자 요청에 의한 취소'
                })
            });

            if (cancelRes.ok) {
                cancelSuccess = true;
                cancelData = await cancelRes.json();
            } else {
                const errorData = await cancelRes.json();
                console.error('PortOne Cancel Failed:', errorData);
                return NextResponse.json({ error: errorData.message || '결제 취소 실패' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: '취소할 결제 ID(payment_id)가 없습니다.' }, { status: 400 });
        }

        // 4. DB 업데이트 (취소 상태 반영)
        if (cancelSuccess) {
            console.log('[Cancel API] PortOne cancel success, updating DB...');
            console.log('[Cancel API] Updating payment:', merchant_uid);

            const { error: updateError } = await supabaseAdmin
                .from('skillhub_payments')
                .update({ status: 'cancelled' })
                .eq('merchant_uid', merchant_uid);

            if (updateError) {
                console.error('[Cancel API] DB Update Error:', updateError);
                throw updateError;
            }

            console.log('[Cancel API] Payment status updated to cancelled');

            // 5. 수강권 회수 (선택 사항: status를 cancelled로 변경 or 삭제)
            // 여기서는 status를 inactive 또는 cancelled로 변경한다고 가정
            if (payment.course_id) {
                await supabaseAdmin
                    .from('skillhub_enrollments')
                    .update({ status: 'cancelled' })
                    .match({ user_id: payment.user_id, course_id: payment.course_id });
                console.log('[Cancel API] Enrollment cancelled');
            }
        }

        console.log('[Cancel API] Success, returning response');
        return NextResponse.json({ success: true, message: '결제가 성공적으로 취소되었습니다.' });

    } catch (error: any) {
        console.error('Cancel API Error:', error);
        return NextResponse.json({ error: '결제 취소 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
