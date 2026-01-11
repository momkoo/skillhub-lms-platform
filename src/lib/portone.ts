/**
 * 포트원 SDK 초기화 및 결제 요청
 * @param {Object} paymentData - 결제 정보
 */
export const requestPortOnePayment = async (paymentData: {
    orderId: string;
    orderName: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customData?: any;
}) => {
    // NPM 패키지 사용으로 변경 (window.PortOne 제거)
    const PortOne = await import("@portone/browser-sdk/v2");

    const {
        orderId,
        orderName,
        amount,
        customerName,
        customerEmail,
        customerPhone,
        customData,
    } = paymentData;

    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

    if (!storeId || !channelKey) {
        console.error("PortOne Keys Missing:", { storeId, channelKey });
        alert("PortOne 설정(Store ID 또는 Channel Key)이 누락되었습니다. .env.local 파일을 확인해주세요.");
        throw new Error("PortOne configuration missing");
    }

    // Validate Amount
    if (isNaN(amount) || amount < 0) {
        console.error("Invalid Amount:", amount);
        alert("결제 금액이 올바르지 않습니다.");
        return;
    }

    console.log("PortOne Requesting Payment...", {
        orderId,
        amount
    });

    try {
        const response = await PortOne.requestPayment({
            storeId,
            channelKey,
            paymentId: orderId,
            orderName,
            totalAmount: amount,
            currency: "CURRENCY_KRW",
            payMethod: "CARD",
            customer: {
                fullName: customerName,
                email: customerEmail,
                phoneNumber: customerPhone,
            },
            customData: customData,
            redirectUrl: `${window.location.origin}/payment/complete`,
        });

        if (response?.code) {
            // 사용자 취소인 경우 에러를 발생시키지 않고 결과 객체 반환
            const isCancelled =
                response.code === 'FAILURE_TYPE_PG' ||
                response.code === 'FAILURE_TYPE_USER_CANCEL' ||
                response.message?.includes('PAY_PROCESS_CANCELED') ||
                response.message?.includes('취소');

            if (isCancelled) {
                console.log("PortOne: User cancelled payment");
                return {
                    cancelled: true,
                    code: response.code,
                    message: response.message,
                };
            }

            // 실제 에러인 경우에만 throw
            const error = new Error(response.message || "결제 실패");
            (error as any).code = response.code;
            throw error;
        }

        return response;
    } catch (error) {
        console.error("PortOne Payment Request Error:", error);
        throw error;
    }
};

/**
 * 결제 상태 코드
 */
export const PAYMENT_STATUS = {
    READY: "READY",
    PAID: "PAID",
    CANCELLED: "CANCELLED",
    FAILED: "FAILED",
};
