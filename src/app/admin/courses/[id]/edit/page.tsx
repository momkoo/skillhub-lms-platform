'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Course Metadata
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        original_price: '',
        description: '',
        category_id: '',
        level: 'beginner',
        thumbnail_url: '',
        is_published: true
    });

    // Lessons Data
    const [lessons, setLessons] = useState<any[]>([]);

    // New Lesson Form
    const [newLesson, setNewLesson] = useState({
        section_title: '섹션 1',
        title: '',
        duration_minutes: 10,
        is_free: false
    });

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}`);
            if (!res.ok) throw new Error('Failed to fetch course');
            const data = await res.json();

            setFormData({
                title: data.title,
                price: data.price.toString(),
                original_price: data.original_price?.toString() || '',
                description: data.description || '',
                category_id: data.category?.id || '',
                level: data.level || 'beginner',
                thumbnail_url: data.thumbnail_url || '',
                is_published: data.is_published
            });

            // Sort lessons by order
            const sortedLessons = (data.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index);
            setLessons(sortedLessons);

        } catch (error) {
            console.error('Error:', error);
            alert('강의 정보를 불러오는데 실패했습니다.');
            router.push('/admin/courses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch('/api/admin/courses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: courseId,
                    ...formData,
                    original_price: formData.original_price ? Number(formData.original_price) : null
                })
            });

            if (res.ok) {
                alert('강의가 성공적으로 수정되었습니다.');
                router.push('/admin/courses');
            } else {
                const data = await res.json();
                alert(data.error || '수정 실패');
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddLesson = async () => {
        if (!newLesson.title) return alert('강의 제목을 입력해주세요');

        try {
            const res = await fetch('/api/admin/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_id: courseId,
                    ...newLesson,
                    order_index: lessons.length + 1
                })
            });

            if (res.ok) {
                // Refresh
                fetchCourse();
                setNewLesson(prev => ({ ...prev, title: '' })); // Reset title only
            } else {
                alert('레슨 추가 실패');
            }
        } catch (e) {
            alert('오류 발생');
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/admin/lessons?id=${id}`, { method: 'DELETE' });
            fetchCourse();
        } catch (e) {
            alert('삭제 실패');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">로딩 중...</div>;

    // Group lessons by section
    const sections: { [key: string]: any[] } = {};
    lessons.forEach(l => {
        if (!sections[l.section_title]) sections[l.section_title] = [];
        sections[l.section_title].push(l);
    });

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8">
                <Link href="/admin/courses" className="text-slate-500 hover:text-slate-700 mb-2 inline-block">
                    ← 목록으로 돌아가기
                </Link>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-800">강의 수정 및 커리큘럼 관리</h1>
                    <a href={`/courses/${courseId}`} target="_blank" className="text-coral-500 font-bold hover:underline">
                        미리보기 ↗
                    </a>
                </div>
            </div>

            <div className="grid gap-8">
                {/* 1. 기본 정보 수정 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-slate-100">기본 정보</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 기존 폼 내용과 동일 (줄임) */}
                        {/* ... 생략된 필드들 ... */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">강의 제목</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-slate-200" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">가격</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-slate-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">정가 (할인 전)</label>
                                <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">썸네일 URL</label>
                            <input type="text" name="thumbnail_url" value={formData.thumbnail_url} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200" />
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={isSaving} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors">
                                {isSaving ? '저장 중...' : '기본 정보 저장'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. 커리큘럼(레슨) 관리 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-slate-100">커리큘럼 (레슨) 관리</h2>

                    {/* 레슨 목록 */}
                    <div className="space-y-6 mb-8">
                        {Object.keys(sections).length === 0 && (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg">
                                등록된 커리큘럼이 없습니다. 아래에서 추가해주세요.
                            </div>
                        )}

                        {Object.entries(sections).map(([secTitle, secLessons]) => (
                            <div key={secTitle} className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 px-4 py-3 font-bold text-slate-700 border-b border-slate-200">
                                    {secTitle}
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {secLessons.map((l: any) => (
                                        <div key={l.id} className="px-4 py-3 flex justify-between items-center bg-white hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                                    {l.order_index}
                                                </span>
                                                <span className="font-medium text-slate-800">{l.title}</span>
                                                {l.is_free && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">무료공개</span>}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-slate-400">{l.duration_minutes}분</span>
                                                <button onClick={() => handleDeleteLesson(l.id)} className="text-red-400 hover:text-red-600 text-sm">삭제</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 레슨 추가 폼 */}
                    <div className="bg-coral-50 p-6 rounded-xl border border-coral-100">
                        <h3 className="font-bold text-coral-800 mb-4">새 레슨 추가</h3>
                        <div className="grid grid-cols-12 gap-3 mb-3">
                            <div className="col-span-3">
                                <input
                                    type="text"
                                    placeholder="섹션명 (예: OT)"
                                    className="w-full px-3 py-2 rounded border border-coral-200 focus:outline-none focus:border-coral-500"
                                    value={newLesson.section_title}
                                    onChange={e => setNewLesson({ ...newLesson, section_title: e.target.value })}
                                />
                            </div>
                            <div className="col-span-6">
                                <input
                                    type="text"
                                    placeholder="강의 제목 (예: 강의 소개)"
                                    className="w-full px-3 py-2 rounded border border-coral-200 focus:outline-none focus:border-coral-500"
                                    value={newLesson.title}
                                    onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <input
                                    type="number"
                                    placeholder="분"
                                    className="w-full px-3 py-2 rounded border border-coral-200 focus:outline-none focus:border-coral-500"
                                    value={newLesson.duration_minutes}
                                    onChange={e => setNewLesson({ ...newLesson, duration_minutes: Number(e.target.value) })}
                                />
                            </div>
                            <div className="col-span-1 flex items-center justify-center">
                                <label className="flex flex-col items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-coral-500"
                                        checked={newLesson.is_free}
                                        onChange={e => setNewLesson({ ...newLesson, is_free: e.target.checked })}
                                    />
                                    <span className="text-[10px] text-coral-600 mt-1">무료</span>
                                </label>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddLesson}
                            className="w-full bg-coral-500 text-white py-3 rounded-lg font-bold hover:bg-coral-600 transition-colors"
                        >
                            + 커리큘럼에 추가하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
