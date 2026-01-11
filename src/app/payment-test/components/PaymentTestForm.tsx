import { useState } from "react";
import { usePaymentTest } from "../hooks/usePaymentTest";

interface PaymentTestFormProps {
    scenario: any;
    onComplete: (result: any) => void;
    onCancel: () => void;
}

const PaymentTestForm: React.FC<PaymentTestFormProps> = ({ scenario, onComplete, onCancel }) => {
    const [customAmount, setCustomAmount] = useState(scenario.amount);
    const [customerInfo, setCustomerInfo] = useState({
        name: "테스트홍길동",
        email: "test@example.com",
        phone: "010-0000-0000",
    });

    const {
        isLoading,
        isProcessing,
        error,
        startPaymentTest,
    } = usePaymentTest();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const testData = {
            scenarioName: scenario.name,
            orderName: `${scenario.name}_TEST`,
            amount: customAmount,
            paymentMethod: scenario.paymentMethod,
            customer: customerInfo,
        };

        try {
            const result = await startPaymentTest(testData);
            onComplete({
                ...result,
                scenario: scenario.name,
                status: result.status || 'success'
            });
        } catch (err: any) {
            console.error("Test execution failed", err);
            // usePaymentTest hook already logs error, parent will handle result display if needed via useEffect or similar, 
            // but here we just pass the failure to the log
            onComplete({
                status: 'failed',
                scenario: scenario.name,
                error: err.message,
                timestamp: new Date().toISOString()
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">{scenario.icon}</span>
                    {scenario.name} 실행
                </h3>
                <button
                    onClick={onCancel}
                    className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        결제 금액 (원)
                    </label>
                    <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-800"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Info (Mock)</p>
                        <input
                            type="text"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                            placeholder="Name"
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded text-sm"
                        />
                        <input
                            type="text"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                            placeholder="Email"
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded text-sm"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 font-bold">
                        ⚠️ {error.message}
                    </div>
                )}

                <div className="flex space-x-3 pt-2">
                    <button
                        type="submit"
                        disabled={isLoading || isProcessing}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        {isLoading ? "준비 중..." : isProcessing ? "결제 처리 중..." : "테스트 실행"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentTestForm;
