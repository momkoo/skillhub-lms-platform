import { useState } from "react";
import { requestPortOnePayment } from "@/lib/portone";

export const usePaymentTest = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [result, setResult] = useState<any>(null);

    const startPaymentTest = async (testData: any) => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // 1. 결제 준비 API 호출
            const prepareResponse = await fetch("/api/payment/prepare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderName: testData.orderName,
                    totalAmount: testData.amount,
                    currency: "KRW",
                    items: [
                        {
                            id: "test_item_001",
                            name: testData.orderName,
                            price: testData.amount,
                            quantity: 1,
                        },
                    ],
                    customer: testData.customer,
                }),
            });

            if (!prepareResponse.ok) {
                const errData = await prepareResponse.json();
                throw new Error(errData.error || "결제 준비 실패");
            }

            const prepareData = await prepareResponse.json();
            const { merchantUid } = prepareData;

            setIsLoading(false);
            setIsProcessing(true);

            // 2. 포트원 결제 요청 (Shared Helper 사용)
            // requestPortOnePayment는 이미 내부적으로 SDK를 동적 로드하고 응답을 반환함
            const paymentResponse = await requestPortOnePayment({
                orderId: `pid-${crypto.randomUUID()}`,
                orderName: testData.orderName,
                amount: testData.amount,
                customerName: testData.customer.name,
                customerEmail: testData.customer.email,
                customerPhone: testData.customer.phone,
            });

            // requestPortOnePayment는 실패 시 에러를 throw하거나, 사용자 취소 시 cancelled: true를 반환함.
            // 취소된 경우 즉시 반환
            if ((paymentResponse as any)?.cancelled) {
                console.log("결제가 사용자에 의해 취소되었습니다.");
                const cancelledResult = {
                    status: "cancelled",
                    error: (paymentResponse as any).message,
                    timestamp: new Date().toISOString(),
                    scenario: testData.scenarioName
                };
                setResult(cancelledResult);
                setIsLoading(false);
                setIsProcessing(false);
                return cancelledResult;
            }

            // 3. 결제 검증 (Verify)
            const verifyResponse = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentId: (paymentResponse as any)?.paymentId,
                    merchantUid: merchantUid,
                }),
            });

            if (!verifyResponse.ok) {
                const errData = await verifyResponse.json();
                throw new Error(errData.error || "결제 검증 실패");
            }

            const verifyData = await verifyResponse.json();

            // 성공 결과 매핑
            const finalResult = {
                status: "success",
                paymentId: (paymentResponse as any)?.paymentId,
                merchantUid: merchantUid,
                amount: testData.amount,
                paymentMethod: testData.paymentMethod,
                timestamp: new Date().toISOString(),
                message: "결제가 성공적으로 검증되었습니다.",
                data: verifyData,
            };

            setResult(finalResult);
            return finalResult; // 결과 반환

        } catch (err: any) {
            // 사용자 취소 감지 (최우선 처리)
            const isCancelled =
                err.code === 'FAILURE_TYPE_PG' ||  // PortOne V2 실제 코드
                err.code === 'FAILURE_TYPE_USER_CANCEL' ||
                err.code === 'USER_CANCEL' ||
                err.code === 'CANCEL' ||
                err.message?.includes('취소') ||
                err.message?.includes('Cancel') ||
                err.message?.includes('PAY_PROCESS_CANCELED') ||
                err.message?.includes('CANCELED');

            if (isCancelled) {
                console.log("결제가 사용자에 의해 취소되었습니다.");
                const cancelledResult = {
                    status: "cancelled",
                    error: err.message,
                    timestamp: new Date().toISOString(),
                    scenario: testData.scenarioName
                };
                setResult(cancelledResult);
                setIsLoading(false);
                setIsProcessing(false);
                return cancelledResult;
            }

            // 실제 에러인 경우에만 에러 상태 설정
            console.error("Payment Test Error:", err.message);
            console.error("Payment Error Code (Debug):", err.code);
            setError(err);
            setResult({
                status: "failed",
                error: err.message,
                timestamp: new Date().toISOString(),
                scenario: testData.scenarioName
            });
            throw err;
        } finally {
            setIsLoading(false);
            setIsProcessing(false);
        }
    };

    const cancelPaymentTest = async (merchantUid: string, reason: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/payment/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ merchant_uid: merchantUid, reason }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "취소 요청 실패");
            }

            const data = await response.json();
            return {
                status: "cancelled",
                message: "결제가 성공적으로 취소되었습니다.",
                timestamp: new Date().toISOString(),
                ...data
            };
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        isProcessing,
        error,
        result,
        startPaymentTest,
        cancelPaymentTest,
    };
};
