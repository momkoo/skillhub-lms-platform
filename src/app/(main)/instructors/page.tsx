'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useInstructors } from '@/hooks';

export default function InstructorsPage() {
    const { data: instructors, isLoading } = useInstructors();

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="pt-32 min-h-screen bg-cream-50">
                    <div className="max-w-7xl mx-auto px-4 py-12">
                        <div className="animate-pulse">
                            <div className="h-10 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
                            <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto mb-16"></div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white h-96 rounded-3xl shadow-sm"></div>
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
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-800 mb-4">전문 강사진</h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            실무 경험이 풍부한 전문가들이 직접 가르치는 맞춤형 강의
                        </p>
                    </div>

                    {/* Instructors Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {instructors?.map((instructor) => (
                            <Link
                                key={instructor.id}
                                href={`/instructors/${instructor.id}`}
                                className="bg-white rounded-3xl p-8 text-center card-hover group"
                            >
                                <Image
                                    src={instructor.avatar_url}
                                    alt={instructor.name}
                                    width={120}
                                    height={120}
                                    className="rounded-full mx-auto mb-4 group-hover:scale-105 transition-transform"
                                />
                                <h3 className="text-xl font-bold text-slate-800 mb-1">{instructor.name}</h3>
                                <p className="text-coral-500 font-medium mb-2">{instructor.specialty}</p>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{instructor.bio}</p>

                                <div className="flex justify-center gap-6 text-sm text-slate-500 mb-4">
                                    <div>
                                        <span className="block font-bold text-slate-800">{instructor.total_courses}</span>
                                        <span>강의</span>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-800">{instructor.total_students.toLocaleString()}</span>
                                        <span>수강생</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-bold text-slate-800">{instructor.average_rating}</span>
                                    </div>
                                </div>

                                <span className="inline-block px-4 py-2 bg-coral-50 text-coral-500 rounded-full text-sm font-medium group-hover:bg-coral-500 group-hover:text-white transition-colors">
                                    프로필 보기
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
