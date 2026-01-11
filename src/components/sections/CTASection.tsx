export default function CTASection() {
    return (
        <section className="py-24 bg-gradient-to-br from-coral-500 to-coral-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="cta-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#cta-pattern)" />
                </svg>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                    지금 시작하면 첫 달<br />
                    <span className="text-amber-300">50% 할인!</span>
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                    무한한 성장의 가능성을 열어보세요. 14일 무료 체험과 함께 나를 바꾸는 첫 걸음을 떼어보세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-white text-coral-500 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                        무료로 시작하기
                    </button>
                    <button className="bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition-colors border border-white/30">
                        상담하기
                    </button>
                </div>
                <p className="text-white/70 text-sm mt-6">신용카드 없이 무료 체험 가능</p>
            </div>
        </section>
    );
}
