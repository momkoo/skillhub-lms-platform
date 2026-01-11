export default function StatsSection() {
    const stats = [
        { value: '50,000+', label: '누적 수강생' },
        { value: '200+', label: '전문 강사' },
        { value: '1,500+', label: '강의 콘텐츠' },
        { value: '98%', label: '수강 만족도' },
    ];

    return (
        <section className="py-16 bg-cream-50 pattern-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center bg-white rounded-2xl p-8 shadow-sm hover:scale-105 transition-transform">
                            <p className="text-4xl font-bold gradient-text mb-2">{stat.value}</p>
                            <p className="text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
