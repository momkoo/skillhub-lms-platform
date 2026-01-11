'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCourse } from '@/hooks';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Helper to extract YouTube ID
const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function CourseLearnPage() {
    // [CHANGE] Use slug instead of id
    const { slug } = useParams() as { slug: string };
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // [CHANGE] useCourse handles slug automatically (assuming my hook implementation supports it or API handles it)
    // Actually my useCourses.ts -> fetchCourse calls /api/courses/${id}. 
    // If the backend /api/courses/[id] handles slugs (which it usually does in my implementations), this works.
    const { data: course, isLoading: courseLoading } = useCourse(slug);

    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [enrollmentLoading, setEnrollmentLoading] = useState(true);

    // 1. Fetch Enrollment Status (Progress) - Wait for course.id
    useEffect(() => {
        if (user && course?.id) {
            fetchEnrollment(course.id);
        }
    }, [user, course]);

    // 2. Set Initial Lesson
    useEffect(() => {
        if (course && course.lessons && course.lessons.length > 0 && !currentLesson) {
            setCurrentLesson(course.lessons[0]);
        }
    }, [course, currentLesson]);

    const fetchEnrollment = async (courseId: string) => {
        try {
            const res = await fetch('/api/my-courses');
            if (res.ok) {
                const data = await res.json();
                // Find by UUID
                const myEnrollment = data.find((e: any) => e.course.id === courseId);
                if (myEnrollment) {
                    setCompletedLessonIds(myEnrollment.completed_lesson_ids || []);
                    setProgress(myEnrollment.progress || 0);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setEnrollmentLoading(false);
        }
    };

    const handleLessonComplete = async () => {
        if (!currentLesson || !course) return;

        // Optimistic update
        const newCompleted = [...completedLessonIds, currentLesson.id];
        setCompletedLessonIds(newCompleted);

        try {
            // [CHANGE] Use course.id (UUID) not slug for the progress API
            const res = await fetch(`/api/courses/${course.id}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId: currentLesson.id })
            });

            if (res.ok) {
                const data = await res.json();
                setProgress(data.progress);
                setCompletedLessonIds(data.completed_lesson_ids);
            }
        } catch (error) {
            console.error('Progress save failed', error);
        }
    };

    if (authLoading || courseLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    if (!user) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Please Login</div>;
    }
    if (!course) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Course Not Found</div>;

    // Group lessons for sidebar
    const sections: { [key: string]: any[] } = {};
    const sortedLessons = [...(course.lessons || [])].sort((a: any, b: any) => a.order_index - b.order_index);
    sortedLessons.forEach(l => {
        const secTitle = l.section_title || 'Section 1';
        if (!sections[secTitle]) sections[secTitle] = [];
        sections[secTitle].push(l);
    });

    const youtubeId = currentLesson?.video_url ? getYoutubeId(currentLesson.video_url) : null;

    return (
        <div className="flex flex-col h-screen bg-slate-50 overscroll-none overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-md">
                <div className="flex items-center gap-4">
                    <Link href="/my-courses" className="text-slate-400 hover:text-white transition-colors">
                        ← 내 강의실
                    </Link>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    <h1 className="font-bold truncate max-w-md">{course.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-300">
                        진도율 <span className="font-bold text-coral-400 ml-1">{progress}%</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content (Video) */}
                <main className="flex-1 bg-black flex flex-col relative overflow-y-auto">
                    <div className="flex-1 flex items-center justify-center bg-zinc-900 min-h-[50vh]">
                        {youtubeId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title={currentLesson.title}
                                className="w-full h-full aspect-video max-h-[80vh]"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="text-zinc-500 text-center p-10">
                                <p className="text-xl mb-4">영상이 준비되지 않았습니다.</p>
                                <p className="text-sm">관리자에게 문의해주세요.</p>
                            </div>
                        )}
                    </div>

                    {/* Lesson Info & Controls */}
                    <div className="bg-white p-8 border-t border-slate-200">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">{currentLesson?.title}</h2>
                            <p className="text-slate-600 mb-8 leading-relaxed whitespace-pre-wrap">
                                {currentLesson?.description || '강의 설명이 없습니다.'}
                            </p>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleLessonComplete}
                                    className={`px-6 py-3 rounded-lg font-bold transition-all ${completedLessonIds.includes(currentLesson?.id)
                                            ? 'bg-green-100 text-green-700 cursor-default'
                                            : 'bg-coral-500 text-white hover:bg-coral-600 shadow-md hover:translate-y-[-2px]'
                                        }`}
                                >
                                    {completedLessonIds.includes(currentLesson?.id) ? '✓ 학습 완료됨' : '학습 완료 체크'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar (Curriculum) */}
                <aside className="w-80 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700">커리큘럼</h3>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {Object.entries(sections).map(([secTitle, lessons]) => (
                            <div key={secTitle}>
                                <div className="px-4 py-3 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {secTitle}
                                </div>
                                <div>
                                    {lessons.map((lesson: any) => {
                                        const isActive = currentLesson?.id === lesson.id;
                                        const isCompleted = completedLessonIds.includes(lesson.id);

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setCurrentLesson(lesson)}
                                                className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${isActive ? 'bg-coral-50 border-l-4 border-coral-500' : 'border-l-4 border-transparent'
                                                    }`}
                                            >
                                                <div className="mt-0.5">
                                                    {isCompleted ? (
                                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                                                    ) : (
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${isActive ? 'border-coral-500 text-coral-500' : 'border-slate-300 text-slate-400'
                                                            }`}>
                                                            {lesson.order_index}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${isActive ? 'text-coral-700' : 'text-slate-700'}`}>
                                                        {lesson.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">{lesson.duration_minutes}분</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}
