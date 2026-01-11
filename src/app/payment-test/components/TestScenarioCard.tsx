import React from 'react';

interface TestScenario {
    id: string;
    name: string;
    description: string;
    category: 'basic' | 'cancel' | 'error' | 'webhook';
    paymentMethod: string;
    amount: number;
    icon: string;
}

interface TestScenarioCardProps {
    scenario: TestScenario;
    onStart: () => void;
    isActive: boolean;
}

const TestScenarioCard: React.FC<TestScenarioCardProps> = ({ scenario, onStart, isActive }) => {
    const categoryColors = {
        basic: "bg-blue-50 text-blue-700 border-blue-200",
        cancel: "bg-red-50 text-red-700 border-red-200",
        error: "bg-yellow-50 text-yellow-700 border-yellow-200",
        webhook: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    return (
        <div
            className={`
      border rounded-lg p-4 cursor-pointer transition-all duration-200
      ${isActive
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }
    `}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{scenario.icon}</span>
                    <div>
                        <h3 className="font-bold text-slate-800">{scenario.name}</h3>
                        <span
                            className={`
              inline-block px-2 py-1 text-xs font-bold rounded-full border mt-1
              ${categoryColors[scenario.category]}
            `}
                        >
                            {scenario.category.toUpperCase()}
                        </span>
                    </div>
                </div>
                <span className="text-sm font-bold text-slate-600">
                    {scenario.amount.toLocaleString()}원
                </span>
            </div>

            <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{scenario.description}</p>

            <button
                onClick={onStart}
                disabled={isActive}
                className={`
          w-full py-2 px-4 rounded-lg text-sm font-bold transition-colors
          ${isActive
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100"
                    }
        `}
            >
                {isActive ? "진행 중..." : "테스트 시작"}
            </button>
        </div>
    );
};

export default TestScenarioCard;
