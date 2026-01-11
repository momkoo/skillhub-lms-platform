'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useInstructors } from '@/hooks';

const colorClasses: Record<string, { bg: string; text: string }> = {
    0: { bg: 'bg-coral-500', text: 'text-coral-500' },
    1: { bg: 'bg-sage-500', text: 'text-sage-600' },
    2: { bg: 'bg-blue-500', text: 'text-blue-600' },
    3: { bg: 'bg-amber-500', text: 'text-amber-600' },
};

export default function InstructorsSection() {
    const { data: instructors, isLoading } = useInstructors();

    if (isLoading) {
        return (
            <section id="instructors" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
                        <div className="h-12 bg-slate-200 rounded w-1/2 mx-auto mb-16"></div>
                        <div className="grid grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-48 bg-slate-100 rounded-3xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="instructors" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">전문 강사</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-3 mb-4">각 분야의 베스트 강사들</h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">실무 경험이 풍부한 전문가들이 직접 가르치는 맞춤형 강의</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {instructors?.slice(0, 4).map((instructor, index) => {
                        const colors = colorClasses[index % 4];
                        return (
                            <Link key={instructor.id} href={`/instructors/${instructor.id}`} className="text-center group hover:-translate-y-2.5 transition-transform duration-300">
                                <div className="relative inline-block mb-4">
                                    <Image
                                        src={instructor.avatar_url}
                                        alt={instructor.name}
                                        width={128}
                                        height={128}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className={`absolute bottom-0 right-0 w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center border-4 border-white`}>
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">{instructor.name}</h3>
                                <p className={`text-sm ${colors.text} font-medium mb-2`}>{instructor.specialty}</p>
                                <p className="text-sm text-slate-500 whitespace-pre-line line-clamp-2">{instructor.bio}</p>
                            </Link>
                        );
                    })}
                </div>

                <div className="text-center mt-12">
                    <Link href="/instructors" className="inline-block border border-slate-200 px-8 py-3 rounded-full font-semibold text-lg hover:bg-coral-50 hover:-translate-y-0.5 transition-all">
                        모든 강사 보기
                    </Link>
                </div>
            </div>
        </section>
    );
}
