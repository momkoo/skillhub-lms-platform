'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('정말 이 회원을 삭제하시겠습니까? (실제 삭제는 관리자 권한이 필요합니다)')) return;

        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                alert('회원이 삭제되었습니다.');
            } else {
                alert('삭제 실패');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('오류가 발생했습니다.');
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">회원 관리</h1>
                <p className="text-slate-500 mt-1">등록된 회원을 조회하고 관리합니다.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <input
                        type="text"
                        placeholder="회원 검색..."
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500"
                    />
                    <div className="flex gap-2">
                        <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none">
                            <option>모든 역할</option>
                            <option>학생</option>
                            <option>관리자</option>
                        </select>
                        <button
                            onClick={fetchUsers}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            title="새로고침"
                        >
                            🔄
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 text-center text-slate-500">회원 목록을 불러오는 중...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">이메일</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">닉네임</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">역할</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">수강 강의</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">가입일</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 text-sm">{user.email}</td>
                                    <td className="py-3 px-4 text-sm">{user.nickname}</td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-coral-100 text-coral-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium">{user.courseCount}개</td>
                                    <td className="py-3 px-4 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <button className="text-blue-500 hover:text-blue-700 text-sm">정보</button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-slate-500">데이터가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
