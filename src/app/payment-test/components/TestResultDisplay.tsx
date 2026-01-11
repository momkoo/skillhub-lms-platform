import React from 'react';

interface TestResult {
    status: 'success' | 'failed' | 'cancelled';
    scenario?: string;
    paymentId?: string;
    amount?: number;
    message?: string;
    error?: string;
    timestamp: string;
}

interface TestResultDisplayProps {
    results: TestResult[];
    onClear: () => void;
}

const TestResultDisplay: React.FC<TestResultDisplayProps> = ({ results, onClear }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "success":
                return "text-green-700 bg-green-50 border-green-200";
            case "failed":
                return "text-red-700 bg-red-50 border-red-200";
            case "cancelled":
                return "text-amber-700 bg-amber-50 border-amber-200";
            default:
                return "text-slate-600 bg-slate-50 border-slate-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "success": return "✅";
            case "failed": return "❌";
            case "cancelled": return "↩️";
            default: return "❓";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                    테스트 로그 ({results.length})
                </h3>
                {results.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                    >
                        기록 삭제
                    </button>
                )}
            </div>

            {results.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                    <span className="text-4xl mb-2 block grayscale opacity-50">📊</span>
                    <p className="text-sm">실행된 테스트가 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className={`
                border rounded-lg p-4 text-sm relative
                ${getStatusColor(result.status)}
              `}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span>{getStatusIcon(result.status)}</span>
                                    <span className="font-bold">{result.scenario || 'Unknown Scenario'}</span>
                                </div>
                                <span className="text-xs opacity-70 font-mono">
                                    {new Date(result.timestamp).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className="space-y-1 pl-7 opacity-90">
                                {result.paymentId && (
                                    <div className="text-xs">ID: <span className="font-mono">{result.paymentId}</span></div>
                                )}
                                {result.amount && (
                                    <div className="text-xs">금액: {result.amount.toLocaleString()}원</div>
                                )}
                                {result.message && (
                                    <div className="text-xs font-medium">{result.message}</div>
                                )}
                                {result.error && (
                                    <div className="text-xs mt-2 p-2 bg-white/50 rounded text-red-600 font-bold border border-red-100">
                                        Error: {result.error}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestResultDisplay;
