'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/admin/courses');
            const data = await res.json();
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Fetch courses error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (courseId: string) => {
        if (!confirm('정말 이 강의를 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.')) return;

        try {
            const res = await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
            if (res.ok) {
                setCourses(prev => prev.filter(c => c.id !== courseId));
            } else {
                const data = await res.json();
                alert(data.error || '삭제 실패');
            }
        } catch (error) {
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">강의 관리</h1>
                    <p className="text-slate-500 mt-1">등록된 강의를 조회하고 관리합니다.</p>
                </div>
                <Link href="/admin/courses/new" className="px-4 py-2 bg-coral-500 text-white rounded-lg font-semibold hover:bg-coral-600 transition-colors inline-block">
                    + 새 강의 등록
                </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                {isLoading ? (
                    <div className="py-20 text-center text-slate-500">강의 목록 로딩 중...</div>
                ) : (
                    <div className="grid gap-4">
                        {courses.map((course) => (
                            <div key={course.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-coral-300 transition-colors">
                                <div className="relative w-24 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={
                                            (course.thumbnail_url?.startsWith('/') || course.thumbnail_url?.startsWith('http'))
                                                ? course.thumbnail_url
                                                : '/assets/images/courses/course-1.jpg'
                                        }
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-800 truncate">{course.title}</h3>
                                    <p className="text-sm text-slate-500">
                                        {course.instructor?.name || '강사 미배정'} • {course.category?.name || '카테고리 없음'}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-slate-800">₩{course.price.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">{course.student_count?.toLocaleString() || 0}명 수강</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Link
                                        href={`/admin/courses/${course.id}/edit`}
                                        className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 text-center"
                                    >
                                        수정
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="px-3 py-1 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                        {courses.length === 0 && (
                            <div className="py-20 text-center text-slate-500">등록된 강의가 없습니다.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
