'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [nickname, setNickname] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const supabase = getSupabaseClient();

    useEffect(() => {
        if (user) {
            setNickname(user.user_metadata?.nickname || user.user_metadata?.name || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');

            // 프로필 테이블에서 데이터 가져오기 (동기화 확인)
            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('skillhub_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setNickname(data.nickname || '');
                    setAvatarUrl(data.avatar_url || '');
                }
            };
            fetchProfile();
        }
    }, [user, supabase]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('skillhub_profiles')
                .update({ nickname, avatar_url: avatarUrl })
                .eq('id', user.id);

            if (error) throw error;
            alert('프로필이 업데이트되었습니다.');
        } catch (err: any) {
            alert('수정 중 오류가 발생했습니다: ' + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">로딩 중...</div>;
    if (!user) return <div className="p-10 text-center text-slate-500">로그인이 필요합니다.</div>;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">내 프로필</h1>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar Preview */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="w-24 h-24 rounded-full bg-coral-50 border-4 border-white shadow-sm overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-coral-300">
                                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">프로필 이미지는 설정에서 변경 가능합니다.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">이메일</label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">닉네임</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임을 입력하세요"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full btn-primary bg-coral-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-coral-100 hover:bg-coral-600 transition-all disabled:opacity-50"
                    >
                        {isUpdating ? '저장 중...' : '프로필 저장하기'}
                    </button>
                </form>
            </div>
        </div>
    );
}
