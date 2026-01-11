'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCourse } from '@/hooks';
import { requestPortOnePayment } from '@/lib/portone';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutContent() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { data: course, isLoading: courseLoading } = useCourse(courseId || '');

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            alert('로그인이 필요합니다.');
            router.push(`/login?returnTo=/checkout?courseId=${courseId}`);
        }
    }, [authLoading, user, router, courseId]);

    if (authLoading || courseLoading) return <div className="p-20 text-center">Loading...</div>;
    if (!course) return <div className="p-20 text-center">강의 정보를 찾을 수 없습니다.</div>;

    const handlePayment = async () => {
        if (!user) return;
        setIsProcessing(true);

        try {
            // 1. [서버] 결제 사전 검증 및 주문번호(merchant_uid) 생성
            const prepareRes = await fetch('/api/payment/prepare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: course.id })
            });

            if (!prepareRes.ok) {
                const errorData = await prepareRes.json();
                if (prepareRes.status === 409) {
                    alert('이미 수강 중인 강의입니다. 내 강의실로 이동합니다.');
                    router.push('/my-courses');
                    return;
                }
                throw new Error(errorData.error || '결제 준비에 실패했습니다.');
            }
            const paymentData = await prepareRes.json();
            const { merchantUid, amount, name, buyer_email, buyer_name } = paymentData;

            // 2. [포트원] 결제 창 호출 (Client SDK)
            const paymentResult = await requestPortOnePayment({
                orderId: merchantUid, // 서버에서 생성한 고유 주문번호 사용
                orderName: name,
                amount: amount,
                customerEmail: buyer_email,
                customerName: buyer_name,
                customerPhone: '010-0000-0000', // 실제로는 유저 입력 필요
                customData: {
                    userId: user.id,
                    courseId: course.id
                }
            });

            console.log('PortOne Result:', paymentResult);

            if (!paymentResult?.code) {
                // 3. [서버] 결제 사후 검증 (Verify)
                const verifyRes = await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId: (paymentResult as any)?.paymentId, // 포트원 결제 ID
                        merchantUid: merchantUid,            // 우리 주문 번호
                    })
                });

                const verifyResult = await verifyRes.json();

                if (verifyRes.ok && verifyResult.success) {
                    alert('결제가 정상적으로 완료되었습니다!');
                    router.replace('/my-courses');
                } else {
                    alert(`결제 검증 실패: ${verifyResult.error || '알 수 없는 오류'}`);
                    // 필요 시 자동 취소 로직 추가 가능
                }
            } else {
                // 결제 실패/취소
                if (paymentResult.code !== 'FAILURE_TYPE_PG') { // 단순 취소가 아닌 경우만 알림
                    alert(`결제 실패: ${paymentResult.message}`);
                }
            }

        } catch (e: any) {
            console.error(e);
            alert('결제 진행 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-20">
            <h1 className="text-3xl font-bold mb-10">수강 신청 / 결제</h1>

            <div className="grid md:grid-cols-2 gap-10">
                {/* 주문 상품 정보 */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-700">신청 강의</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="aspect-video relative bg-slate-100">
                            {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                            <p className="text-slate-500 text-sm mb-4">{course.instructor?.name}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">수강기간</span>
                                <span className="font-medium">무제한 (평생소장)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결제 정보 */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-700">결제 금액</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <div className="flex justify-between items-center text-slate-500">
                            <span>상품 금액</span>
                            <span>{course.original_price?.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between items-center text-coral-500">
                            <span>할인 금액</span>
                            <span>- {(course.original_price! - course.price).toLocaleString()}원</span>
                        </div>
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xl font-bold text-slate-800">
                            <span>최종 결제 금액</span>
                            <span>{course.price.toLocaleString()}원</span>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full bg-coral-500 text-white py-4 rounded-xl font-bold hover:bg-coral-600 transition-colors mt-4 disabled:opacity-50"
                        >
                            {isProcessing ? '결제 처리 중...' : `${course.price.toLocaleString()}원 결제하기`}
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-2">
                            위 내용은 테스트 결제이며 실제 돈이 청구되지 않습니다. (테스트 모드)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
