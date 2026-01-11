'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { signUpWithEmail, signInWithGoogle, signInWithKakao } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!agreed) {
            setError('이용약관에 동의해주세요.');
            return;
        }

        if (password.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        setLoading(true);

        const { error } = await signUpWithEmail(email, password, name);

        if (error) {
            setError('회원가입에 실패했습니다. 다시 시도해주세요.');
            setLoading(false);
        } else {
            router.push('/login?message=registered');
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-coral-400 to-coral-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">S</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">SkillHub</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 mt-6">회원가입</h1>
                    <p className="text-slate-500 mt-2">무료로 학습을 시작하세요</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Social Signup */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl py-3 px-4 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google로 가입하기
                    </button>
                    <button
                        onClick={signInWithKakao}
                        className="w-full flex items-center justify-center gap-3 bg-[#FEE500] rounded-xl py-3 px-4 font-medium text-slate-800 hover:bg-[#FADA0A] transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.86 5.32 4.64 6.72-.14.86-.52 3.11-.6 3.58-.09.56.2.55.43.4.17-.12 2.77-1.88 3.9-2.64.53.08 1.08.12 1.63.12 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z" />
                        </svg>
                        카카오로 가입하기
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500">또는</span>
                    </div>
                </div>

                {/* Email Signup Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-coral-500 focus:ring-2 focus:ring-coral-100 outline-none transition-colors"
                            placeholder="이름을 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-coral-500 focus:ring-2 focus:ring-coral-100 outline-none transition-colors"
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-coral-500 focus:ring-2 focus:ring-coral-100 outline-none transition-colors"
                            placeholder="8자 이상 입력하세요"
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="rounded border-slate-300 text-coral-500 focus:ring-coral-500 mt-1"
                            />
                            <span className="text-sm text-slate-600">
                                <a href="#" className="text-coral-500 hover:text-coral-600">이용약관</a> 및{' '}
                                <a href="#" className="text-coral-500 hover:text-coral-600">개인정보처리방침</a>에 동의합니다.
                            </span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-coral-500 text-white py-3 rounded-xl font-semibold hover:bg-coral-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? '가입 중...' : '가입하기'}
                    </button>
                </form>

                <p className="text-center text-slate-500 mt-6">
                    이미 회원이신가요?{' '}
                    <Link href="/login" className="text-coral-500 font-medium hover:text-coral-600">
                        로그인
                    </Link>
                </p>
            </div>
        </div>
    );
}
