'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                setStats({
                    totalUsers: data.totalUsers || 0,
                    totalCourses: data.totalCourses || 0,
                    totalEnrollments: data.totalEnrollments || 0,
                    totalRevenue: data.totalRevenue || 0,
                });
            } catch (error) {
                console.error('Fetch stats error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: '총 회원수', value: stats.totalUsers.toLocaleString(), icon: '👥', color: 'bg-blue-500' },
        { label: '총 강의수', value: stats.totalCourses.toLocaleString(), icon: '📚', color: 'bg-green-500' },
        { label: '총 수강등록', value: stats.totalEnrollments.toLocaleString(), icon: '📝', color: 'bg-purple-500' },
        { label: '총 매출', value: `₩${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-coral-500' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">관리자 대시보드</h1>
                <p className="text-slate-500 mt-1">SkillHub 운영 현황을 한눈에 확인하세요.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">{card.label}</p>
                                {isLoading ? (
                                    <div className="h-8 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                                )}
                            </div>
                            <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center text-2xl`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">빠른 작업</h2>
                    <div className="space-y-3">
                        <a href="/admin/courses" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">➕</span>
                            <span className="font-medium">새 강의 등록</span>
                        </a>
                        <a href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">👤</span>
                            <span className="font-medium">회원 관리</span>
                        </a>
                        <a href="/admin/content" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <span className="text-2xl">📋</span>
                            <span className="font-medium">게시글 관리</span>
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">최근 활동</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-slate-600">새 회원 가입: user@example.com</span>
                            <span className="text-slate-400 ml-auto">방금 전</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="text-slate-600">강의 구매: Python 입문</span>
                            <span className="text-slate-400 ml-auto">5분 전</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span className="text-slate-600">새 후기 등록: ⭐⭐⭐⭐⭐</span>
                            <span className="text-slate-400 ml-auto">10분 전</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
