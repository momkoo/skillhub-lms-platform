'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const adminMenuItems = [
    { name: '대시보드', href: '/admin', icon: '📊' },
    { name: '회원 관리', href: '/admin/users', icon: '👥' },
    { name: '강의 관리', href: '/admin/courses', icon: '📚' },
    { name: '주문 관리', href: '/admin/orders', icon: '💰' },
    { name: '게시판 관리', href: '/admin/content', icon: '📝' },
    { name: '설정', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();


    // 캐싱된 쿼리로 역할 조회 (중복 호출 방지)
    const { data: userRole } = useQuery({
        queryKey: ['userRole', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const res = await fetch('/api/auth/profile');
            const data = await res.json();
            return data.role;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });

    // Show loading while checking role
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <p className="text-lg text-slate-600">로그인이 필요합니다.</p>
                    <Link href="/login" className="mt-4 inline-block text-coral-500 font-semibold">
                        로그인 페이지로 이동 →
                    </Link>
                </div>
            </div>
        );
    }

    if (userRole && userRole !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <p className="text-xl font-bold text-red-500">⛔ 접근 권한이 없습니다</p>
                    <p className="mt-2 text-slate-600">관리자만 접근할 수 있는 페이지입니다.</p>
                    <Link href="/" className="mt-4 inline-block text-coral-500 font-semibold">
                        홈으로 돌아가기 →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-coral-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <div>
                            <span className="text-xl font-bold">SkillHub</span>
                            <span className="block text-xs text-slate-400">Admin</span>
                        </div>
                    </Link>
                </div>

                <nav className="mt-6">
                    {adminMenuItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors
                                    ${isActive
                                        ? 'bg-coral-500 text-white border-l-4 border-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700 bg-slate-900">
                    <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-2 mb-3">
                        ← 메인 사이트로 이동
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 font-medium"
                    >
                        🚪 관리자 로그아웃
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
