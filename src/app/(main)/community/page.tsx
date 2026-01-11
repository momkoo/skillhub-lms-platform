'use client';

import { useState } from 'react';
import { useBoardPosts, useBoardCategories } from '@/hooks';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function CommunityPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: categories } = useBoardCategories();
    const { data: posts, isLoading } = useBoardPosts({
        category: selectedCategory || undefined,
        search: searchQuery || undefined
    });

    return (
        <>
            <Header />
            <main className="min-h-screen bg-cream-50 pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">커뮤니티</h1>
                            <p className="text-slate-500">지식을 나누고 함께 성장하는 공간입니다.</p>
                        </div>
                        <Link
                            href="/community/new"
                            className="mt-4 md:mt-0 bg-coral-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-coral-600 transition-colors flex items-center gap-2 w-fit"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            글쓰기
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar Filters */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                <h2 className="font-bold text-slate-800 mb-4">카테고리</h2>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${!selectedCategory ? 'bg-coral-50 text-coral-500 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        전체보기
                                    </button>
                                    {categories?.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${selectedCategory === cat.id ? 'bg-coral-50 text-coral-500 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                <h2 className="font-bold text-slate-800 mb-4">검색</h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="제목 또는 내용 검색"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-coral-500 text-sm"
                                    />
                                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Posts List */}
                        <div className="lg:col-span-3">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="bg-white h-40 rounded-3xl animate-pulse shadow-sm border border-slate-100" />
                                    ))}
                                </div>
                            ) : posts && posts.length > 0 ? (
                                <div className="space-y-4">
                                    {posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/community/${post.id}`}
                                            className="block bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-coral-200 transition-all hover:translate-y-[-2px] group"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                                                {post.author?.avatar_url && (
                                                                    <img src={post.author.avatar_url} alt={post.author.nickname} className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <span className="text-slate-600">{post.author?.nickname || '익명'}</span>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${post.category?.color || 'slate'}-50 text-${post.category?.color || 'slate'}-500`}>
                                                            {post.category?.name}
                                                        </span>
                                                        <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-coral-500 transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                                        {post.excerpt || post.content.substring(0, 150)}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            {post.view_count.toLocaleString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                            {post.like_count.toLocaleString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                            {post.comment_count.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {post.thumbnail_url && (
                                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden hidden sm:block">
                                                        <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">게시글이 없습니다.</h3>
                                    <p className="text-slate-500">첫 번째 이야기를려주세요!</p>
                                    <Link href="/community/new" className="text-coral-500 font-bold mt-4 inline-block hover:underline">
                                        글 쓰러 가기
                                    </Link>
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
