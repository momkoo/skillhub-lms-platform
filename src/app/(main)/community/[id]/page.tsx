'use client';

import { use, useState, useEffect } from 'react';
import { useBoardPost, useBoardComments, toggleLike, createComment } from '@/hooks';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: post, isLoading, refetch: refetchPost } = useBoardPost(id);
    const { data: comments, refetch: refetchComments } = useBoardComments(id);

    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-cream-50 pt-24 pb-20">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-white rounded-3xl h-96 animate-pulse" />
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!post) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-cream-50 pt-24 pb-20 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">게시글을 찾을 수 없습니다.</h2>
                        <Link href="/community" className="text-coral-500 font-bold hover:underline">목록으로 돌아가기</Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const handleLike = async () => {
        setIsLiking(true);
        try {
            await toggleLike(id);
            refetchPost();
        } catch (error) {
            alert('로그인이 필요한 기능입니다.');
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setIsSubmitting(true);
        try {
            await createComment(id, commentContent);
            setCommentContent('');
            refetchComments();
            refetchPost();
        } catch (error) {
            alert('댓글 작성에 실패했습니다. 로그인을 확인해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-cream-50 pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Navigation */}
                    <Link href="/community" className="flex items-center gap-1 text-slate-500 hover:text-coral-500 transition-colors mb-6 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        목록으로 돌아가기
                    </Link>

                    {/* Post Content */}
                    <article className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${post.category?.color || 'slate'}-50 text-${post.category?.color || 'slate'}-500`}>
                                {post.category?.name}
                            </span>
                            <span className="text-sm text-slate-400">{new Date(post.created_at).toLocaleString()}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 leading-tight">
                            {post.title}
                        </h1>

                        <div className="prose prose-slate max-w-none mb-12 text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </div>

                        {post.thumbnail_url && (
                            <div className="relative aspect-video rounded-3xl overflow-hidden mb-12">
                                <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" />
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-8 border-y border-slate-100 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                    {post.author?.avatar_url && (
                                        <img src={post.author.avatar_url} alt={post.author.nickname} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <span className="font-bold text-slate-700">{post.author?.nickname || '익명'}</span>
                            </div>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <div className="text-sm text-slate-400">
                                조회 {post.view_count.toLocaleString()}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-50 text-slate-600 hover:bg-coral-50 hover:text-coral-500 transition-all font-bold group"
                                >
                                    <svg className={`w-5 h-5 ${isLiking ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    좋아요 {post.like_count}
                                </button>
                            </div>
                        </div>
                    </article>

                    {/* Comment Section */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-8">댓글 {post.comment_count}</h2>

                        {/* Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="mb-12">
                            <div className="relative">
                                <textarea
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder="댓글을 남겨보세요..."
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-coral-500 min-h-[120px] transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !commentContent.trim()}
                                    className="absolute bottom-4 right-4 bg-coral-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-coral-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? '등록 중...' : '등록'}
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-8">
                            {comments && comments.length > 0 ? (
                                comments.map((comment: any) => (
                                    <div key={comment.id} className="p-4 bg-slate-50 rounded-2xl group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                                {comment.author?.avatar_url && (
                                                    <img src={comment.author.avatar_url} alt={comment.author.nickname} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <span className="font-bold text-sm text-slate-700">{comment.author?.nickname || '익명'}</span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-400 text-sm">첫 번째 댓글을 남겨보세요!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
