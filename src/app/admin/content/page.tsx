'use client';

import { useState } from 'react';

// 임시 데이터 (DB 연동 전)
const INITIAL_POSTS = [
    { id: 1, title: '[공지] 서비스 업데이트 안내', category: '공지사항', author: '관리자', date: '2024-01-08', type: 'notice' },
    { id: 2, title: 'Python 강의 질문있습니다', category: '질문', author: 'user1', date: '2024-01-07', type: 'qna' },
    { id: 3, title: '이 강의 추천합니다!', category: '자유게시판', author: 'studious', date: '2024-01-06', type: 'free' },
    { id: 4, title: '강사님 질문이요', category: '질문', author: 'dev_king', date: '2024-01-05', type: 'qna' },
];

export default function AdminContentPage() {
    const [posts, setPosts] = useState(INITIAL_POSTS);

    const handleDelete = (id: number) => {
        if (!confirm('게시글을 삭제하시겠습니까?')) return;

        // API 연동 시 여기에 fetch DELETE 호출
        setPosts(prev => prev.filter(post => post.id !== id));
        alert('삭제되었습니다.');
    };

    const handleEdit = (id: number) => {
        alert('게시글 수정 기능은 준비 중입니다.');
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">게시판 관리</h1>
                <p className="text-slate-500 mt-1">커뮤니티 게시글을 관리합니다.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none">
                        <option>모든 카테고리</option>
                        <option>공지사항</option>
                        <option>질문</option>
                        <option>자유게시판</option>
                    </select>
                    <input
                        type="text"
                        placeholder="게시글 검색..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500"
                    />
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">제목</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">카테고리</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">작성자</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">작성일</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm font-medium">{post.title}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${post.type === 'notice' ? 'bg-red-100 text-red-600' :
                                            post.type === 'qna' ? 'bg-blue-100 text-blue-600' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {post.category}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm">{post.author}</td>
                                <td className="py-3 px-4 text-sm text-slate-500">{post.date}</td>
                                <td className="py-3 px-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(post.id)}
                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-slate-500">게시글이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
