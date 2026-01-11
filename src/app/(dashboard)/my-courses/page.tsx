'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MyCoursesPage() {
    const { user, loading: authLoading } = useAuth();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyCourses();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchMyCourses = async () => {
        try {
            const res = await fetch('/api/my-courses');
            if (res.ok) {
                const data = await res.json();
                setEnrollments(data);
            }
        } catch (error) {
            console.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div className="p-20 text-center text-slate-500">로딩 중...</div>;
    if (!user) return <div className="p-20 text-center text-slate-500">로그인이 필요합니다.</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">내 강의실</h1>
                    <p className="text-slate-500 mt-2">수강 중인 강의를 이어서 학습해 보세요.</p>
                </div>
                <div className="hidden sm:block">
                    <span className="bg-coral-50 text-coral-600 px-4 py-2 rounded-full font-bold text-sm">
                        총 {enrollments.length}개의 강의
                    </span>
                </div>
            </div>

            {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrollments.map((item) => {
                        const course = item.course;
                        const progress = item.progress || 0; // Default 0

                        return (
                            <div key={item.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="relative aspect-video overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    <div className="absolute bottom-4 right-4">
                                        <span className="bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1 rounded-lg font-bold text-xs">
                                            {course.lesson_count || 0}강
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-coral-500 transition-colors line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6">{course.instructor?.name || 'SkillHub 강사'}</p>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-400">학습 진도율</span>
                                            <span className="text-coral-500">{progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-coral-400 to-coral-500 transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <Link
                                            href={`/courses/${course.slug || course.id}/learn`}
                                            className="block w-full text-center bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors mt-4"
                                        >
                                            이어 학습하기
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">수강 중인 강의가 없습니다.</h3>
                    <p className="text-slate-500 mb-8">나에게 꼭 필요한 강의를 찾아 성장을 시작해 보세요!</p>
                    <Link href="/courses" className="btn-primary inline-block bg-coral-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-coral-100 hover:bg-coral-600 transition-all">
                        강의 둘러보기
                    </Link>
                </div>
            )}
        </div>
    );
}
