'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<void>;
    signInWithKakao: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseClient();

    // 마운트 상태 추적 - AbortError 시 상태 업데이트 방지
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        const initAuth = async () => {
            console.log('[AuthContext] Initializing session...');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                // 컴포넌트가 언마운트되었으면 상태 업데이트 하지 않음
                if (!isMounted.current) {
                    console.log('[AuthContext] Component unmounted, skipping state update');
                    return;
                }

                if (error) {
                    console.error('[AuthContext] getSession error:', error);
                    // 401 Unauthorized 또는 RefreshToken 만료 시 세션 초기화
                    if (error.status === 401 || error.message.includes('Invalid Refresh Token')) {
                        setSession(null);
                        setUser(null);
                    }
                } else {
                    console.log('[AuthContext] Session found:', !!session);
                    setSession(session);
                    setUser(session?.user ?? null);
                }
            } catch (err: any) {
                // AbortError는 HMR(개발 모드)에서 정상적으로 발생 -> 무시 (기존 세션 유지)
                if (err?.name === 'AbortError') {
                    console.log('[AuthContext] AbortError (HMR) - keeping existing session state');
                    return;
                }

                // 그 외 에러는 로그 출력
                console.error('[AuthContext] Unexpected error:', err);

                // 401 에러가 throw된 경우 처리
                if (err?.status === 401 && isMounted.current) {
                    setSession(null);
                    setUser(null);
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        // onAuthStateChange는 더 안정적 - 이걸 주로 사용
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event: AuthChangeEvent, currentSession: Session | null) => {
                console.log('[AuthContext] Auth change:', event, !!currentSession);

                if (!isMounted.current) return;

                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUpWithEmail = async (email: string, password: string, name?: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });
        return { error };
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signInWithKakao = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signInWithEmail,
                signUpWithEmail,
                signInWithGoogle,
                signInWithKakao,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
