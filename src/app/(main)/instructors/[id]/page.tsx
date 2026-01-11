'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useInstructor, useCourses } from '@/hooks';

export default function InstructorDetailPage() {
    const { id } = useParams() as { id: string };
    const { data: instructor, isLoading: isInstructorLoading } = useInstructor(id);
    const { data: courses, isLoading: isCoursesLoading } = useCourses({ instructorId: id });

    if (isInstructorLoading) {
        return (
            <>
                <Header />
                <main className="pt-32 min-h-screen bg-cream-50">
                    <div className="max-w-7xl mx-auto px-4 py-12">
                        <div className="animate-pulse flex gap-8">
                            <div className="w-40 h-40 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 space-y-4">
                                <div className="h-10 bg-slate-200 rounded w-1/4"></div>
                                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                                <div className="h-20 bg-slate-200 rounded w-full"></div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!instructor) {
        return (
            <>
                <Header />
                <main className="pt-40 text-center min-h-screen">
                    <h1 className="text-2xl font-bold">강사를 찾을 수 없습니다.</h1>
                    <Link href="/instructors" className="text-coral-500 mt-4 inline-block">강사 목록으로 돌아가기</Link>
                </main>
                <Footer />
            </>
        );
    }


    return (
        <>
            <Header />
            <main className="pt-20 min-h-screen bg-cream-50">
                {/* Profile Header */}
                <div className="bg-white border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 py-12">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <Image
                                src={instructor.avatar_url}
                                alt={instructor.name}
                                width={150}
                                height={150}
                                className="rounded-full h-40 w-40 object-cover"
                            />
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold text-slate-800 mb-2">{instructor.name}</h1>
                                <p className="text-coral-500 font-medium mb-4">{instructor.specialty}</p>
                                <p className="text-slate-600 max-w-2xl mb-6">{instructor.bio}</p>

                                <div className="flex justify-center md:justify-start gap-8">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-slate-800">{instructor.total_courses}</p>
                                        <p className="text-sm text-slate-500">강의</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-slate-800">{instructor.total_students.toLocaleString()}</p>
                                        <p className="text-sm text-slate-500">수강생</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <p className="text-2xl font-bold text-slate-800">{instructor.average_rating}</p>
                                        </div>
                                        <p className="text-sm text-slate-500">평균 평점</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses */}
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <h2 className="text-2xl font-bold mb-6">{instructor.name} 강사의 강의</h2>
                    <div className="space-y-4">
                        {courses?.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.id}`}
                                className="block bg-white rounded-xl p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-slate-800">{course.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span>{course.student_count.toLocaleString()}명 수강</span>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span>{course.average_rating}</span>
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
