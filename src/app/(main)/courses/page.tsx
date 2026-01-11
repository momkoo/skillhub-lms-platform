'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCourses, useCategories } from '@/hooks';

export default function CoursesPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data: courses, isLoading } = useCourses({ category: selectedCategory || undefined });
    const { data: categoriesData } = useCategories();

    // 카테고리 목록 구성
    const categories = [
        { id: 'all', name: '전체' },
        ...(categoriesData || []).map((c: any) => ({ id: c.id, name: c.name }))
    ];

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="pt-32 min-h-screen bg-cream-50">
                    <div className="max-w-7xl mx-auto px-4 py-12">
                        <div className="animate-pulse">
                            <div className="h-10 bg-slate-200 rounded w-1/4 mb-4"></div>
                            <div className="h-6 bg-slate-200 rounded w-1/2 mb-12"></div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white h-80 rounded-3xl shadow-sm"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="pt-20 min-h-screen bg-cream-50">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-800 mb-4">전체 강의</h1>
                        <p className="text-lg text-slate-500">다양한 분야의 전문 강의를 만나보세요</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${(cat.id === 'all' && !selectedCategory) || cat.id === selectedCategory
                                        ? 'bg-coral-500 text-white'
                                        : 'bg-white text-slate-600 hover:bg-coral-50'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Course Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses?.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm card-hover group"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {course.badge && (
                                        <div className="absolute top-4 left-4 bg-coral-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            {course.badge}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-6">
                                    {/* Tags */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-sage-100 text-sage-600 rounded text-xs font-medium">{course.category?.name || '개발'}</span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">{course.level === 'beginner' ? '초급' : course.level === 'intermediate' ? '중급' : course.level === 'advanced' ? '고급' : '전체수준'}</span>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-coral-500 transition-colors line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.short_description || course.description}</p>

                                    {/* Instructor */}
                                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                                        {course.instructor?.avatar_url ? (
                                            <Image
                                                src={course.instructor.avatar_url}
                                                alt={course.instructor.name}
                                                width={28}
                                                height={28}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 bg-coral-100 rounded-full flex items-center justify-center">
                                                <span className="text-coral-600 text-xs font-bold">👤</span>
                                            </div>
                                        )}
                                        <span className="text-sm text-slate-600">{course.instructor?.name || '강사'}</span>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {course.duration_hours || '10'}시간
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                {course.student_count?.toLocaleString() || 0}명
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rating & Price */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-semibold text-slate-800">{course.average_rating?.toFixed(1) || '0.0'}</span>
                                            <span className="text-slate-400">({course.review_count?.toLocaleString() || 0})</span>
                                        </div>
                                        <div className="text-right">
                                            {course.original_price && course.original_price > course.price && (
                                                <span className="text-sm text-slate-400 line-through mr-2">₩{course.original_price.toLocaleString()}</span>
                                            )}
                                            <span className="text-xl font-bold text-coral-500">₩{course.price?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
