'use client';

import { useState, useEffect } from "react";
import TestScenarioCard from "./components/TestScenarioCard";
import PaymentTestForm from "./components/PaymentTestForm";
import TestResultDisplay from "./components/TestResultDisplay";
import { usePaymentTest } from "./hooks/usePaymentTest";

export default function PaymentTestPage() {
    const [activeTest, setActiveTest] = useState<any>(null);
    const [testResults, setTestResults] = useState<any[]>([]);
    const { cancelPaymentTest } = usePaymentTest();

    // 안전장치: 프로덕션 환경 체크 (클라이언트 사이드라 완벽하진 않지만 1차 방어)
    // 실제로는 middleware나 layout에서 막는 것이 더 확실함
    const isDev = process.env.NODE_ENV === 'development';

    const testScenarios = [
        {
            id: "basic-payment",
            name: "일반 결제 (토스/카드)",
            description: "기본값 1초 내에 승인되는 신용카드 결제 시나리오입니다.",
            category: "basic",
            paymentMethod: "CARD",
            amount: 1000,
            icon: "💳",
        },
        {
            id: "cancel-test",
            name: "결제 후 즉시 취소",
            description: "결제 승인 직후 환불(Cancel) API를 호출하여 전체 환불을 테스트합니다.",
            category: "cancel",
            paymentMethod: "CARD",
            amount: 5000, // 취소 테스트용 금액
            icon: "↩️",
        },
        // {
        //   id: "webhook-test",
        //   name: "웹훅 테스트 (가상)",
        //   description: "실제 결제 없이 가상 웹훅 이벤트를 발생시킵니다.",
        //   category: "webhook",
        //   paymentMethod: "VIRTUAL",
        //   amount: 0,
        //   icon: "🔗",
        // },
    ] as const;

    const handleTestStart = (scenario: any) => {
        setActiveTest(scenario);
    };

    const handleTestComplete = async (result: any) => {
        // 만약 'cancel-test' 시나리오라면, 성공 후 즉시 취소 로직 수행
        if (result.status === 'success' && activeTest?.id === 'cancel-test') {
            try {
                const cancelRes = await cancelPaymentTest(result.merchantUid, "테스트 페이지 자동 취소");
                setTestResults((prev) => [{ ...cancelRes, scenario: '자동 취소(Refund)' }, result, ...prev]);
            } catch (e) {
                setTestResults((prev) => [{ status: 'failed', error: '자동 취소 실패', timestamp: new Date().toISOString() }, result, ...prev]);
            }
        } else {
            setTestResults((prev) => [result, ...prev]);
        }
        setActiveTest(null);
    };

    const clearTestResults = () => {
        setTestResults([]);
    };

    if (!isDev) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100">
                    <span className="text-4xl">🚫</span>
                    <h1 className="text-2xl font-bold text-slate-800 mt-4">접근 제한</h1>
                    <p className="text-slate-500 mt-2">이 페이지는 개발 환경에서만 접근할 수 있습니다.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase mb-4 inline-block">
                        Developer Area
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        PortOne 결제 테스트 랩
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg">
                        결제 승인, 검증, 그리고 <span className="text-red-500 font-bold">환불(취소)</span> 시나리오를 안전하게 검증하세요.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Scenarios & Form */}
                    <div className="lg:col-span-2 space-y-6">

                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-lg font-bold text-slate-800">테스트 시나리오</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {testScenarios.map((scenario) => (
                                    <TestScenarioCard
                                        key={scenario.id}
                                        scenario={scenario}
                                        onStart={() => handleTestStart(scenario)}
                                        isActive={activeTest?.id === scenario.id}
                                    />
                                ))}
                            </div>
                        </section>

                        {activeTest && (
                            <PaymentTestForm
                                scenario={activeTest}
                                onComplete={handleTestComplete}
                                onCancel={() => setActiveTest(null)}
                            />
                        )}
                    </div>

                    {/* Right Column: Logs */}
                    <div className="space-y-6">
                        <TestResultDisplay results={testResults} onClear={clearTestResults} />

                        <div className="bg-blue-900 rounded-xl p-6 text-white shadow-xl">
                            <h3 className="font-bold text-lg mb-2">💡 테스트 가이드</h3>
                            <ul className="space-y-2 text-sm text-blue-100 list-disc list-inside">
                                <li>결제 금액은 테스트용으로 실제 청구되지 않습니다. (Test Mode)</li>
                                <li><strong>결제 후 즉시 취소</strong> 시나리오는 승인 후 자동으로 환불 API를 호출합니다.</li>
                                <li>로그가 'Success'여야 DB에도 정상 반영된 것입니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
