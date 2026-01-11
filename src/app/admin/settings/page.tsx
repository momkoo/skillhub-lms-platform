'use client';

export default function AdminSettingsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">설정</h1>
                <p className="text-slate-500 mt-1">사이트 설정을 관리합니다.</p>
            </div>

            <div className="grid gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">기본 설정</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">사이트 이름</label>
                            <input
                                type="text"
                                defaultValue="SkillHub"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">사이트 설명</label>
                            <textarea
                                defaultValue="당신의 성장을 위한 온라인 강의 플랫폼"
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">알림 설정</h2>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-coral-500" />
                            <span className="text-sm">새 회원 가입 알림</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-coral-500" />
                            <span className="text-sm">새 결제 알림</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4 text-coral-500" />
                            <span className="text-sm">새 게시글 알림</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="px-6 py-2 bg-coral-500 text-white rounded-lg font-semibold hover:bg-coral-600 transition-colors">
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}
