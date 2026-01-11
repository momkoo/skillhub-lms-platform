const steps = [
    {
        number: 1,
        title: '무료 회원가입',
        description: '간단한 정보 입력으로 무료 회원이 됩니다. 소셜 로그인도 지원해요.',
        color: 'coral',
    },
    {
        number: 2,
        title: '원하는 강의 선택',
        description: '관심 분야의 강의를 둘러보고 무료 강의를 먼저 체험해보세요.',
        color: 'sage',
    },
    {
        number: 3,
        title: '실력 향상',
        description: '체계적인 커리큘럼과 함께 목표한 실력을 쌓아보세요.',
        color: 'blue',
    },
];

const colorClasses: Record<string, { bg: string; ring: string }> = {
    coral: { bg: 'bg-coral-500', ring: 'bg-coral-200' },
    sage: { bg: 'bg-sage-500', ring: 'bg-sage-200' },
    blue: { bg: 'bg-blue-500', ring: 'bg-blue-200' },
};

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 bg-cream-50 pattern-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">이용안내</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-3 mb-4">3가지 단계로 시작하기</h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">복잡한 과정 없이 쉽고 빠르게 나만의 학습 여정을 시작하세요</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step) => {
                        const colors = colorClasses[step.color];
                        return (
                            <div key={step.number} className="text-center group">
                                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                                    <div className={`absolute inset-0 ${colors.ring} rounded-full transform scale-90 group-hover:scale-100 transition-transform duration-300 opacity-50`} />
                                    <div className={`relative w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center`}>
                                        <span className="text-3xl font-bold text-white">{step.number}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                                <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
