'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const { user, loading, signOut } = useAuth();


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        const handleClickOutside = () => setIsUserMenuOpen(false);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // React Query for caching profile fetch
    const { data: userRole } = useQuery({
        queryKey: ['userRole', user?.id],
        queryFn: async () => {
            if (!user) return null;
            const res = await fetch('/api/auth/profile');
            if (!res.ok) return null;
            const data = await res.json();
            return data.role;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });


    const handleSignOut = async () => {
        await signOut();
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 nav-blur border-b border-coral-100 transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-coral-400 to-coral-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">SkillHub</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/courses" className="text-slate-600 hover:text-coral-500 font-medium transition-colors">강의</Link>
                        <Link href="/instructors" className="text-slate-600 hover:text-coral-500 font-medium transition-colors">강사</Link>
                        <Link href="/about" className="text-slate-600 hover:text-coral-500 font-medium transition-colors">소개</Link>
                        <Link href="/community" className="text-slate-600 hover:text-coral-500 font-medium transition-colors">커뮤니티</Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="w-24 h-10 bg-slate-100 rounded-full animate-pulse"></div>
                        ) : (
                            user ? (
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-slate-50 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-coral-50 border border-coral-200 overflow-hidden group-hover:border-coral-400 transition-all">
                                            {user.user_metadata?.avatar_url ? (
                                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-coral-500">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-slate-700 font-bold group-hover:text-coral-500 transition-colors">
                                            {user.user_metadata?.name || user.user_metadata?.nickname || user.email?.split('@')[0]}님
                                        </span>
                                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* User Dropdown */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-coral-500 transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                내 프로필
                                            </Link>
                                            {/* Role-based menu items */}
                                            {userRole === 'admin' ? (
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-coral-500 transition-colors font-semibold"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    🛠️ 관리자 페이지
                                                </Link>
                                            ) : (
                                                <Link
                                                    href="/my-courses"
                                                    className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-coral-500 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    내 강의
                                                </Link>
                                            )}
                                            <Link
                                                href="/orders"
                                                className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-coral-500 transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                주문 내역
                                            </Link>
                                            <hr className="my-2 border-slate-50" />

                                            <button
                                                onClick={handleSignOut}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                                            >
                                                로그아웃
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="text-slate-600 hover:text-coral-500 font-medium transition-colors">로그인</Link>
                                    <Link href="/register" className="btn-primary bg-coral-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-coral-600">
                                        무료 시작하기
                                    </Link>
                                </>
                            )
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-coral-100">
                    <div className="px-4 py-4 space-y-3">
                        <Link href="/courses" className="block py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>강의</Link>
                        <Link href="/instructors" className="block py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>강사</Link>
                        <Link href="/about" className="block py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>소개</Link>
                        <Link href="/community" className="block py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>커뮤니티</Link>
                        <hr className="border-coral-100" />
                        {!loading && (
                            user ? (
                                <>
                                    <Link href="/profile" className="block py-2 text-slate-700 font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                                        내 프로필 ({user.user_metadata?.name || user.email?.split('@')[0]}님)
                                    </Link>
                                    {/* Role-based menu items */}
                                    {userRole === 'admin' ? (
                                        <Link href="/admin" className="block py-2 text-coral-500 font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                                            🛠️ 관리자 페이지
                                        </Link>
                                    ) : (
                                        <Link href="/my-courses" className="block py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                            내 강의
                                        </Link>
                                    )}
                                    <Link href="/orders" className="block py-2 text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                        주문 내역
                                    </Link>

                                    <button
                                        onClick={handleSignOut}
                                        className="block w-full text-left py-2 text-red-500 font-bold"
                                    >
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="block w-full py-2 text-slate-600 font-medium text-center" onClick={() => setIsMobileMenuOpen(false)}>로그인</Link>
                                    <Link href="/register" className="block w-full btn-primary bg-coral-500 text-white px-6 py-3 rounded-full font-semibold text-center" onClick={() => setIsMobileMenuOpen(false)}>
                                        무료 시작하기
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
