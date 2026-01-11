'use client';

import React from 'react';
import { useCategories } from '@/hooks/useCategories';

const icons: Record<string, React.ReactNode> = {
    code: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    design: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
    business: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    language: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    finance: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    media: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
};

const colorClasses: Record<string, { bg: string; text: string; count: string; card: string; border: string }> = {
    coral: { bg: 'bg-coral-500', text: 'text-coral-700', count: 'text-coral-500', card: 'from-coral-50', border: 'border-coral-100' },
    sage: { bg: 'bg-sage-500', text: 'text-sage-700', count: 'text-sage-600', card: 'from-sage-50', border: 'border-sage-100' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-700', count: 'text-blue-600', card: 'from-blue-50', border: 'border-blue-100' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-700', count: 'text-amber-600', card: 'from-amber-50', border: 'border-amber-100' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-700', count: 'text-rose-600', card: 'from-rose-50', border: 'border-rose-100' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', count: 'text-emerald-600', card: 'from-emerald-50', border: 'border-emerald-100' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', count: 'text-indigo-600', card: 'from-indigo-50', border: 'border-indigo-100' },
};

export default function CategoriesSection() {
    const { data: categories, isLoading } = useCategories();

    return (
        <section id="courses" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">카테고리</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-3 mb-4">배우고 싶은 분야를 선택하세요</h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        다양한 분야의 전문가들이 준비한 실무 중심의 강의들로 나를 성장시켜보세요.
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-slate-500">카테고리 로딩 중...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories?.map((category, index) => {
                            const colors = colorClasses[category.color] || colorClasses['coral'];
                            return (
                                <div
                                    key={category.id}
                                    className={`bg-gradient-to-br ${colors.card} to-white rounded-3xl p-6 cursor-pointer border ${colors.border} hover:translate-y-[-8px] hover:rotate-1 transition-all duration-300`}
                                >
                                    <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-4`}>
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {icons[category.icon] || icons['code']}
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{category.name}</h3>
                                    <p className="text-sm text-slate-500">{category.description}</p>
                                    <p className={`text-xs ${colors.count} font-medium mt-3`}>{category.count} 강의</p>
                                </div>
                            );
                        })}


                        {/* View All Card */}
                        <div className="bg-slate-100 rounded-3xl p-6 cursor-pointer border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:translate-y-[-8px] transition-all duration-300">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 mb-1">더 많은 분야</h3>
                            <p className="text-sm text-slate-400">30+ 분야</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
