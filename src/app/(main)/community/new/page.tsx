'use client';

import { useState } from 'react';
import { useBoardCategories, createPost } from '@/hooks';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FileUpload from '@/components/storage/FileUpload';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPostPage() {
    const router = useRouter();
    const { data: categories } = useBoardCategories();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !categoryId || !password.trim()) {
            alert('모든 필드(제목, 내용, 카테고리, 게시글 비밀번호)를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const post = await createPost({
                title,
                content,
                category_id: categoryId,
                thumbnail_url: thumbnailUrl,
                password: password
            });
            router.push(`/community/${post.id}`);
        } catch (error) {
            alert('글 작성에 실패했습니다. 로그인을 확인해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-cream-50 pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="mb-8">
                        <Link href="/community" className="text-sm text-slate-500 hover:text-coral-500 font-medium flex items-center gap-1 mb-4">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            커뮤니티로 돌아가기
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-800">새 이야기 작성</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">카테고리</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-coral-500 transition-all text-slate-700"
                                    required
                                >
                                    <option value="">카테고리 선택</option>
                                    {categories?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">제목</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="제목을 입력하세요"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-coral-500 transition-all text-slate-800 font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    게시글 비밀번호 (이중 보안 🛡️)
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="수정/삭제 시 사용할 비밀번호"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-coral-500 transition-all text-slate-800 font-medium"
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">로그인 정보와 별개로 이 글을 보호하기 위해 사용됩니다.</p>
                            </div>

                            <FileUpload
                                onUploadComplete={(url) => setThumbnailUrl(url)}
                                folder="posts"
                                label="대표 이미지 (선택)"
                            />

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">내용</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="당신의 지식이나 고민을 나누어주세요."
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-coral-500 min-h-[300px] transition-all text-slate-800 leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="pt-6 flex justify-end gap-4">
                                <Link
                                    href="/community"
                                    className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    취소
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-coral-500 text-white px-10 py-3 rounded-2xl font-bold hover:bg-coral-600 transition-all shadow-lg shadow-coral-500/25 disabled:bg-slate-300 disabled:shadow-none"
                                >
                                    {isSubmitting ? '등록 중...' : '등록하기'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
