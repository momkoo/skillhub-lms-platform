'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCourses } from '@/hooks';

export default function CoursesSection() {
    const { data: courses, isLoading } = useCourses({ featured: true, limit: 3 });

    if (isLoading) {
        return (
            <section className="py-24 bg-cream-50 pattern-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
                        <div className="h-12 bg-slate-200 rounded w-1/2 mb-12"></div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white h-96 rounded-3xl shadow-sm"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-cream-50 pattern-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
                    <div>
                        <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">인기 강의</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-2">지금 가장 사랑받는 강의</h2>
                    </div>
                    <a href="#" className="mt-4 md:mt-0 text-coral-500 font-semibold hover:text-coral-600 flex items-center gap-1">
                        모든 강의 보기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses?.map((course) => (
                        <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-sm card-hover group">
                            <Link href={`/courses/${course.slug}`} className="block">
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
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-sage-100 text-sage-600 rounded text-xs font-medium">{course.category.name}</span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">{course.level === 'beginner' ? '초급' : course.level === 'intermediate' ? '중급' : course.level === 'advanced' ? '고급' : '전체수준'}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-coral-500 transition-colors">{course.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.short_description}</p>

                                    <div className="flex items-center gap-3 mb-4">
                                        <Image src={course.instructor.avatar_url} alt={course.instructor.name} width={32} height={32} className="rounded-full" />
                                        <span className="text-sm text-slate-600">{course.instructor.name}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-semibold text-slate-800">{course.average_rating}</span>
                                            <span className="text-sm text-slate-500">({course.review_count.toLocaleString()})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className="text-sm text-slate-500">{course.student_count.toLocaleString()}명</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {course.original_price && (
                                                    <span className="text-lg text-slate-400 line-through mr-2">₩{course.original_price.toLocaleString()}</span>
                                                )}
                                                <span className="text-2xl font-bold text-slate-800">₩{course.price.toLocaleString()}</span>
                                            </div>
                                            <button className="w-10 h-10 bg-coral-100 text-coral-500 rounded-full flex items-center justify-center hover:bg-coral-500 hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
