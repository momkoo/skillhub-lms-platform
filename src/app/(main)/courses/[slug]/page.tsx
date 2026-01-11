'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCourse } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { requestPortOnePayment } from '@/lib/portone';
import { useState } from 'react';

export default function CourseDetailPage() {
    const { slug } = useParams() as { slug: string };
    const router = useRouter();
    const { user } = useAuth();
    const { data: course, isLoading } = useCourse(slug);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleEnrollment = async () => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            router.push(`/login?returnTo=/courses/${slug}`);
            return;
        }

        if (!course) return;

        // [Logic Update] 유료 강의는 결제 페이지로 이동
        if (course.price > 0) {
            router.push(`/checkout?courseId=${course.id}`);
            return;
        }

        // [Free Course] 무료 강의는 즉시 등록
        try {
            setIsProcessing(true);
            const response = await fetch('/api/courses/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: course.id })
            });

            const data = await response.json();
            if (!response.ok) {
                if (response.status === 409 || data.error?.includes('already')) {
                    alert('이미 수강 중인 강의입니다.');
                    router.push('/my-courses');
                    return;
                }
                throw new Error(data.error || '수강 신청 실패');
            }

            alert('무료 수강 신청이 완료되었습니다! 내 강의실로 이동합니다.');
            router.push('/my-courses');

        } catch (error: any) {
            console.error('Enrollment Error:', error);
            alert(error.message || '처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="pt-20 min-h-screen bg-cream-50">
                    <div className="animate-pulse">
                        <div className="bg-slate-900 h-64 w-full mb-12"></div>
                        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-2 space-y-4">
                                <div className="h-10 bg-slate-200 rounded w-1/2"></div>
                                <div className="h-6 bg-slate-200 rounded w-full"></div>
                                <div className="h-6 bg-slate-200 rounded w-full"></div>
                            </div>
                            <div className="bg-white h-96 rounded-2xl shadow-xl"></div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!course) {
        return (
            <>
                <Header />
                <main className="pt-40 text-center min-h-screen">
                    <h1 className="text-2xl font-bold">강의를 찾을 수 없습니다.</h1>
                    <Link href="/courses" className="text-coral-500 mt-4 inline-block">강의 목록으로 돌아가기</Link>
                </main>
                <Footer />
            </>
        );
    }


    return (
        <>
            <Header />
            <main className="pt-20 min-h-screen bg-cream-50">
                {/* Hero */}
                <div className="bg-slate-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-coral-500 rounded-full text-sm">{course.category.name}</span>
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{course.level === 'beginner' ? '초급' : course.level === 'intermediate' ? '중급' : course.level === 'advanced' ? '고급' : '전체수준'}</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                                <p className="text-lg text-white/80 mb-6">{course.description}</p>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-bold">{course.average_rating}</span>
                                        <span className="text-white/60">({course.review_count.toLocaleString()} 후기)</span>
                                    </div>
                                    <span className="text-white/60">{course.student_count.toLocaleString()}명 수강</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Image src={course.instructor.avatar_url} alt={course.instructor.name} width={48} height={48} className="rounded-full" />
                                    <div>
                                        <p className="font-semibold">{course.instructor.name}</p>
                                        <p className="text-sm text-white/60">{course.instructor.specialty}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price Card */}
                            <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-xl">
                                <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                                    <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
                                </div>

                                {/* Price Display with Discount */}
                                <div className="mb-6">
                                    {course.original_price && course.original_price > course.price ? (
                                        <div className="flex flex-col items-start">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-slate-400 line-through text-lg font-medium">₩{course.original_price.toLocaleString()}</span>
                                                <span className="bg-coral-100 text-coral-600 px-2 py-0.5 rounded text-sm font-bold">
                                                    {Math.round(((course.original_price - course.price) / course.original_price) * 100)}% OFF
                                                </span>
                                            </div>
                                            <div className="text-3xl font-bold text-coral-600">₩{course.price.toLocaleString()}</div>
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold mb-4">
                                            {course.price === 0 ? '무료' : `₩${course.price.toLocaleString()}`}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleEnrollment}
                                    disabled={isProcessing}
                                    className={`w-full bg-coral-500 text-white py-4 rounded-full font-semibold text-lg hover:bg-coral-600 transition-colors mb-3 flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            처리 중...
                                        </>
                                    ) : (course.price === 0 ? '무료 수강 신청하기' : '수강 신청하기')}
                                </button>

                                <button
                                    onClick={async () => {
                                        if (!user) {
                                            alert('로그인이 필요합니다.');
                                            return;
                                        }
                                        try {
                                            const res = await fetch('/api/cart', {
                                                method: 'POST',
                                                body: JSON.stringify({ courseId: course.id }),
                                            });
                                            if (res.ok) {
                                                if (confirm('장바구니에 담겼습니다. 장바구니로 이동할까요?')) {
                                                    router.push('/cart');
                                                }
                                            }
                                        } catch (error) {
                                            alert('장바구니 담기에 실패했습니다.');
                                        }
                                    }}
                                    className="w-full border border-slate-200 py-3 rounded-full font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    장바구니에 담기
                                </button>
                                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">총 강의시간</span>
                                        <span className="font-medium">{course.duration_hours}시간</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">강의 수</span>
                                        <span className="font-medium">{course.lesson_count}개</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Curriculum FASTCAMPUS Style */}
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <h2 className="text-2xl font-bold mb-6">커리큘럼</h2>

                    {(!course.lessons || course.lessons.length === 0) ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl text-slate-500">
                            아직 등록된 커리큘럼이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {(() => {
                                // Group lessons by section
                                const sections: { [key: string]: any[] } = {};
                                const sortedLessons = [...course.lessons].sort((a, b) => a.order_index - b.order_index);

                                sortedLessons.forEach(l => {
                                    const secTitle = l.section_title || 'Section 1';
                                    if (!sections[secTitle]) sections[secTitle] = [];
                                    sections[secTitle].push(l);
                                });

                                return Object.entries(sections).map(([secTitle, lessons], idx) => (
                                    <div key={secTitle} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800 text-lg">{secTitle}</h3>
                                            <span className="text-sm text-slate-500">{lessons.length}강</span>
                                        </div>
                                        <div className="divide-y divide-slate-100 bg-white">
                                            {lessons.map((lesson: any, i: number) => (
                                                <div key={lesson.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors group cursor-default">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-medium group-hover:bg-coral-100 group-hover:text-coral-600 transition-colors">
                                                            {i + 1}
                                                        </span>
                                                        <span className="font-medium text-slate-700 group-hover:text-slate-900">
                                                            {lesson.title}
                                                        </span>
                                                        {lesson.is_free && (
                                                            <span className="px-2 py-0.5 bg-coral-100 text-coral-600 text-xs font-bold rounded">
                                                                무료공개
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-slate-400 font-medium">
                                                        {lesson.duration_minutes}분
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    )}

                    <div className="mt-8 text-center pt-8">
                        <Link href="/courses" className="text-slate-400 font-medium hover:text-slate-600 underline decoration-slate-300 underline-offset-4">
                            다른 강의 더 보기
                        </Link>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">수강생 후기</h2>
                            <p className="text-slate-500 mt-1">
                                평균 ⭐ {course.average_rating?.toFixed(1) || '0.0'} ({course.review_count?.toLocaleString() || 0}개의 후기)
                            </p>
                        </div>
                    </div>

                    {/* Reviews Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Placeholder reviews - will be replaced with API data */}
                        {[
                            { id: 1, rating: 5, content: '정말 훌륭한 강의입니다! 기초부터 차근차근 설명해주셔서 이해가 잘 됐어요.', nickname: '열공맨', created_at: '2024-01-05' },
                            { id: 2, rating: 5, content: '실무에서 바로 적용할 수 있는 내용이라 좋았습니다. 강추!', nickname: '개발초보', created_at: '2024-01-03' },
                            { id: 3, rating: 4, content: '전반적으로 만족스러웠어요. 다음 강의도 기대됩니다!', nickname: '코딩러버', created_at: '2024-01-01' },
                            { id: 4, rating: 5, content: '강사님의 설명이 정말 친절하고 이해하기 쉬웠어요.', nickname: '학습러', created_at: '2023-12-28' },
                        ].map((review) => (
                            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-coral-100 rounded-full flex items-center justify-center">
                                            <span className="text-coral-600 font-bold">{review.nickname.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{review.nickname}</p>
                                            <p className="text-xs text-slate-400">{review.created_at}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-600 leading-relaxed">{review.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="text-center mt-8">
                        <button className="px-6 py-3 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-colors">
                            더 많은 후기 보기
                        </button>
                    </div>
                </div>

                {/* Course Features */}
                <div className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200">
                    <h2 className="text-2xl font-bold mb-8">이 강의의 특징</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">평생 무제한 수강</h3>
                            <p className="text-sm text-slate-500">한 번 결제로 평생 소장하세요</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">수료증 발급</h3>
                            <p className="text-sm text-slate-500">완강 시 수료증을 드려요</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-2">1:1 질문 지원</h3>
                            <p className="text-sm text-slate-500">강사에게 직접 질문하세요</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
