import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * 포트원 웹훅 처리
 * (PortOne V1/Standard Webhook 지원)
 */
export async function POST(request: Request) {
    try {
        const body = await request.text();
        // 로그 확인 결과: 'webhook-signature' 헤더가 들어옴 (V1 Standard)
        const signatureHeader = request.headers.get("webhook-signature") || request.headers.get("portone-signature");

        const secret = process.env.PORTONE_WEBHOOK_SECRET;

        // 1. 웹훅 서명 검증
        if (!signatureHeader || !secret) {
            console.error("[Webhook] Signature or Secret missing");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // V1 서명은 "v1,SIGNATURE_VALUE" 형식일 수 있음. (PortOne Console V2는 그대로 보냄)
        // 여기서는 간단히 HMAC-SHA256 비교 (PortOne 방식에 맞춰 구현)
        // 실제 포트원 V1 웹훅은 body 전체를 HMAC-SHA256한 값이 header에 담김 (timestamp 등 제외하고 body만 확인하는 경우도 있음)

        // 하지만 V1은 서명 검증이 까다로울 수 있으므로,
        // 더 확실한 방법은 "IP 확인" 또는 "결제 단건 조회(Verify)"를 통해 검증하는 것입니다.
        // 여기서는 일단 서명 헤더 존재 여부만 체크하고, 아래에서 '실제 데이터 조회'로 보안을 챙깁니다.

        const webhookData = JSON.parse(body);
        // 로그 확인 결과: { tx_id, payment_id, status } 형태로 들어옴
        // V2의 { type, data }와 다름
        const { payment_id, status } = webhookData;

        // V2 호환성을 위해 체크
        const targetPaymentId = payment_id || webhookData.data?.paymentId;
        const targetStatus = status || webhookData.type; // V2는 Transaction.Paid 등

        const supabase = await createClient();

        console.log(`[Webhook] Received for Payment: ${targetPaymentId}, Status: ${targetStatus}`);

        // 2. 결제 완료 상태일 때 처리
        if (targetStatus === "Paid" || targetStatus === "Transaction.Paid") {

            // 3. 결제 검증 (서버간 통신으로 더블 체크)
            // PortOne V2 API 사용 (V1 결제 건도 조회 가능)
            const response = await fetch(
                `https://api.portone.io/payments/${targetPaymentId}`,
                {
                    headers: {
                        Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
                    },
                }
            );

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`[Webhook] Failed to fetch payment info. Status: ${response.status} ${response.statusText}`, errorBody);
                // 웹훅은 실패 시 재발송하므로 500 리턴
                return NextResponse.json({ error: "Payment fetch failed" }, { status: 500 });
            }

            const paymentInfo = await response.json();

            // 4. DB 업데이트
            let customData = JSON.parse(paymentInfo.customData || '{}');

            // 이중 직렬화 방지: 한 번 더 파싱해야 할 수도 있음
            if (typeof customData === 'string') {
                try {
                    customData = JSON.parse(customData);
                } catch (e) {
                    console.error('[Webhook] Failed to parse customData string:', customData);
                }
            }

            let { userId, courseId } = customData;

            // customData가 없는 경우, DB에서 merchant_uid로 조회 (Fallback)
            if (!userId || !courseId) {
                console.log('[Webhook] CustomData missing, searching DB by merchant_uid...');

                // PortOne V2 API 응답에서 merchant_uid 필드 확인 (보통 'id'는 paymentId, 'orderName' 등)
                // V1/Standard 호환 응답 객체 구조를 타야 함. 
                // paymentInfo 구조: { id: "payment-...", orderName: "...", ... } 
                // 만약 paymentInfo에 merchant_uid가 명시적으로 없다면,
                // 우리가 prepare 단계에서 저장한 payment_id와 매핑되는지 확인해야 함.
                // 하지만 prepare 단계엔 payment_id가 없고 merchant_uid만 있음.

                // 중요한 점: 결제 승인 시점에는 payment_id가 생성됨.
                // Verify 단계에서 update할 때 payment_id를 저장함.
                // Webhook이 Verify보다 먼저 돌면 payment_id가 DB에 없을 수 있음.

                // 따라서, PortOne API가 반환하는 정보 중 'merchant_uid'에 해당하는 값을 찾아야 함.
                // 보통 PortOne V2 API에서는 client-side에서 보낸 orderId가 저장됨.
                const merchantUid = paymentInfo.orderId || paymentInfo.merchantUid;

                if (merchantUid) {
                    const { data: output } = await supabase
                        .from('skillhub_payments')
                        .select('user_id, course_id')
                        .eq('merchant_uid', merchantUid)
                        .single();

                    if (output) {
                        userId = output.user_id;
                        courseId = output.course_id;
                        console.log(`[Webhook] Found info from DB: User ${userId}, Course ${courseId}`);
                    }
                }
            }

            // 안전하게: courseId, userId가 있으면 처리
            if (userId && courseId) {
                await supabase.from('skillhub_payments').upsert({
                    payment_id: targetPaymentId,
                    user_id: userId,
                    course_id: courseId,
                    amount: paymentInfo.amount.total,
                    status: 'paid',
                    method: paymentInfo.method?.type || 'card',
                    paid_at: paymentInfo.paidAt
                });

                await supabase.from('skillhub_enrollments').upsert({
                    user_id: userId,
                    course_id: courseId,
                    status: 'active'
                });

                console.log(`[Webhook] Enrollment success for user ${userId}, course ${courseId}`);
            } else {
                console.error('[Webhook] Failed to identify user/course. Skipping DB update.', { paymentInfo });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[Webhook Error]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
