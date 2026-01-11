import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
    title: '소개 | SkillHub',
    description: 'SkillHub는 다양한 분야의 전문가들과 함께 실무에 바로 쓸 수 있는 기술을 배울 수 있는 온라인 학습 플랫폼입니다.',
};

export default async function AboutPage() {
    const supabase = await createClient();

    // Fetch Stats
    const [{ count: students }, { count: instructors }, { count: courses }] = await Promise.all([
        supabase.from('skillhub_profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('skillhub_instructors').select('*', { count: 'exact', head: true }),
        supabase.from('skillhub_courses').select('*', { count: 'exact', head: true }).eq('is_published', true)
    ]);

    const stats = {
        students: students || 0,
        instructors: instructors || 0,
        courses: courses || 0,
        satisfaction: 98
    };

    return (
        <>
            <Header />
            <main className="pt-20 min-h-screen bg-cream-50">
                {/* Hero */}
                <div className="bg-gradient-to-br from-coral-500 to-coral-600 text-white py-20">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">나를 성장시키는 새로운 방식</h1>
                        <p className="text-xl text-white/90">
                            SkillHub는 다양한 분야의 전문가들과 함께<br />
                            실무에 바로 쓸 수 있는 기술을 배울 수 있는 온라인 학습 플랫폼입니다.
                        </p>
                    </div>
                </div>

                {/* Mission */}
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-6">우리의 미션</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                누구나 원하는 기술을 배우고, 자신의 가능성을 확장할 수 있는 세상을 만듭니다.
                                실무 경험이 풍부한 전문가들이 직접 가르치는 체계적인 커리큘럼으로
                                여러분의 성장을 돕습니다.
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                2020년 설립 이후, {stats.students.toLocaleString()}명 이상의 수강생에게 {stats.courses.toLocaleString()}개 이상의 강의를 제공하며
                                {stats.satisfaction}%의 수강 만족도를 달성했습니다.
                            </p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="grid grid-cols-2 gap-8 text-center">
                                <div>
                                    <p className="text-4xl font-bold gradient-text mb-2">{stats.students.toLocaleString()}+</p>
                                    <p className="text-slate-500">수강생</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold gradient-text mb-2">{stats.instructors.toLocaleString()}+</p>
                                    <p className="text-slate-500">전문 강사</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold gradient-text mb-2">{stats.courses.toLocaleString()}+</p>
                                    <p className="text-slate-500">강의 콘텐츠</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold gradient-text mb-2">{stats.satisfaction}%</p>
                                    <p className="text-slate-500">수강 만족도</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">핵심 가치</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-8">
                                <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-coral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">실무 중심</h3>
                                <p className="text-slate-600">현업 전문가들이 실제 업무에서 사용하는 기술과 노하우를 전달합니다.</p>
                            </div>
                            <div className="text-center p-8">
                                <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">함께 성장</h3>
                                <p className="text-slate-600">학습 커뮤니티와 멘토링을 통해 혼자가 아닌 함께 성장합니다.</p>
                            </div>
                            <div className="text-center p-8">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">지속적 혁신</h3>
                                <p className="text-slate-600">최신 트렌드를 반영한 콘텐츠로 항상 앞서나가는 학습을 제공합니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
