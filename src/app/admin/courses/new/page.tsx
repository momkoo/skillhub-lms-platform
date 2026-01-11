'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCoursePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [publishMode, setPublishMode] = useState('immediate'); // immediate, scheduled, earlybird, private
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        original_price: '',
        description: '',
        category_id: '82ca0337-8372-4910-bb32-352ff62c748e',
        level: 'beginner',
        thumbnail_url: '',
        is_published: true,
        published_at: '',
        start_date: '',
        max_stock: '' // 추가
    });

    const handleModeChange = (mode: string) => {
        setPublishMode(mode);
        const now = new Date();
        const nowStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16); // Local ISO string for datetime-local

        if (mode === 'immediate') {
            setFormData(prev => ({ ...prev, is_published: true, published_at: '', start_date: '' }));
        } else if (mode === 'private') {
            setFormData(prev => ({ ...prev, is_published: false }));
        } else if (mode === 'earlybird') {
            setFormData(prev => ({ ...prev, is_published: true, published_at: '' })); // start_date needs input
        } else if (mode === 'scheduled') {
            setFormData(prev => ({ ...prev, is_published: true })); // published_at & start_date need input
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // [가격 실수 방지 안전장치]
        const currentPrice = Number(formData.price);
        const originalPrice = formData.original_price ? Number(formData.original_price) : 0;

        // 1. 음수 체크
        if (currentPrice < 0 || originalPrice < 0) {
            alert('가격은 0원 이상이어야 합니다.');
            return;
        }

        // 2. 가격 역전 체크 (판매가가 정가보다 비쌈)
        if (originalPrice > 0 && currentPrice > originalPrice) {
            alert('⚠️ 판매가가 정가보다 비쌉니다!\n가격을 반대로 입력하셨는지 확인해주세요.');
            return;
        }

        // 3. 초저가 경고 (1,000원 미만 유료 강의, '0' 하나 빠뜨린 경우 방지)
        if (currentPrice > 0 && currentPrice < 1000) {
            if (!confirm(`⚠️ 판매가가 ${currentPrice.toLocaleString()}원으로 설정되었습니다.\n(1,000원 미만입니다)\n\n이 가격이 맞습니까?`)) {
                return;
            }
        }

        // 4. 과도한 할인율 경고 ('0' 하나 더 붙이거나 뺀 경우 방지)
        if (originalPrice > 0) {
            const discountRate = ((originalPrice - currentPrice) / originalPrice) * 100;
            if (discountRate >= 80) {
                if (!confirm(`⚠️ 현재 할인율이 ${Math.round(discountRate)}%로 매우 높습니다!\n\n정가: ${originalPrice.toLocaleString()}원\n판매가: ${currentPrice.toLocaleString()}원\n\n'0'을 빠뜨리지 않았는지 확인해주세요.\n이대로 등록하시겠습니까?`)) {
                    return;
                }
            }
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('강의가 성공적으로 등록되었습니다.');
                router.push('/admin/courses');
            } else {
                const data = await res.json();
                alert(data.error || '등록 실패');
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <Link href="/admin/courses" className="text-slate-500 hover:text-slate-700 mb-2 inline-block">
                    ← 목록으로 돌아가기
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">새 강의 등록</h1>
            </div>

            <div className="max-w-3xl bg-white rounded-2xl p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 제목 */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">강의 제목</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500"
                            placeholder="예: 파이썬 기초 마스터"
                            required
                        />
                    </div>

                    {/* 가격 & 레벨 & 재고 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">가격 설정 (할인율 적용)</label>
                            <div className="space-y-4">
                                {/* 정가 입력 */}
                                <div>
                                    <span className="text-xs text-slate-500 mb-1 block">정가 (원래 가격)</span>
                                    <input
                                        type="number"
                                        name="original_price"
                                        value={formData.original_price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500 bg-slate-50"
                                        placeholder="예: 100000"
                                    />
                                </div>

                                {/* 할인율 선택 버튼 (Original Price가 있을 때만 활성화) */}
                                <div className="flex gap-2 flex-wrap">
                                    {[10, 20, 30, 50, 100].map((rate) => (
                                        <button
                                            key={rate}
                                            type="button"
                                            onClick={() => {
                                                const original = Number(formData.original_price);
                                                if (!original) {
                                                    alert('먼저 정가를 입력해주세요.');
                                                    return;
                                                }
                                                const discounted = rate === 100 ? 0 : Math.floor(original * (1 - rate / 100));
                                                setFormData(prev => ({ ...prev, price: String(discounted) }));
                                            }}
                                            className="px-3 py-1.5 text-sm rounded bg-slate-100 hover:bg-coral-100 hover:text-coral-600 text-slate-600 transition-colors border border-slate-200"
                                        >
                                            {rate === 100 ? '무료' : `${rate}%`}
                                        </button>
                                    ))}
                                </div>

                                {/* 판매가 (자동 계산됨) */}
                                <div className="relative">
                                    <span className="text-xs text-coral-600 font-bold mb-1 block">판매가 (실제 결제 금액)</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-coral-100 focus:outline-none focus:border-coral-500 bg-white font-bold text-coral-600"
                                        placeholder="할인율을 선택하거나 직접 입력"
                                        required
                                    />
                                </div>

                                {/* 할인율 표시 */}
                                {formData.original_price && formData.price && Number(formData.original_price) > Number(formData.price) && (
                                    <div className="text-right text-sm text-coral-500 font-bold animate-in fade-in">
                                        총 {Math.round(((Number(formData.original_price) - Number(formData.price)) / Number(formData.original_price)) * 100)}% 할인됨
                                        <span className="ml-2 text-slate-400 font-normal line-through">{Number(formData.original_price).toLocaleString()}원</span>
                                        <span className="ml-2 text-lg">→ {Number(formData.price).toLocaleString()}원</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-6 md:col-span-1">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">난이도</label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500"
                                >
                                    <option value="beginner">입문 (Beginner)</option>
                                    <option value="intermediate">중급 (Intermediate)</option>
                                    <option value="advanced">고급 (Advanced)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">최대 판매 수량 (재고)</label>
                                <input
                                    type="number"
                                    name="max_stock"
                                    value={(formData as any).max_stock || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500"
                                    placeholder="비워두면 무제한 판매"
                                />
                                <p className="text-xs text-slate-500 mt-1">* 입력하지 않으면 수량 제한 없이 판매됩니다.</p>
                            </div>
                        </div>
                    </div>

                    {/* 카테고리 (임시 - 하드코딩된 옵션) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">카테고리</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500"
                        >
                            <option value="82ca0337-8372-4910-bb32-352ff62c748e">프로그래밍</option>
                            <option value="a316d4d5-00c0-4514-b530-c512b248b0be">데이터 & AI</option>
                            <option value="6015b682-9e06-49c0-9ad7-173ef037909f">디자인</option>
                            <option value="df71967a-1f86-4c40-b81b-21f44da8b704">비즈니스</option>
                            <option value="f5214b83-0a66-4d9c-af1f-672a76d2df0b">외국어</option>
                            <option value="c5000000-0000-0000-0000-000000000005">영상/사진</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">* 카테고리 ID가 DB에 존재해야 합니다.</p>
                    </div>


                    {/* 공개 및 출시 설정 */}
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 space-y-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">출시 방식</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleModeChange('immediate')}
                                className={`p-4 rounded-lg border text-left transition-all ${publishMode === 'immediate' ? 'border-coral-500 bg-coral-50 text-coral-700' : 'border-slate-200 hover:border-coral-300'}`}
                            >
                                <div className="font-bold">⚡ 즉시 공개</div>
                                <div className="text-xs mt-1 opacity-75">지금 바로 수강신청을 받습니다.</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange('scheduled')}
                                className={`p-4 rounded-lg border text-left transition-all ${publishMode === 'scheduled' ? 'border-coral-500 bg-coral-50 text-coral-700' : 'border-slate-200 hover:border-coral-300'}`}
                            >
                                <div className="font-bold">📅 예약 오픈</div>
                                <div className="text-xs mt-1 opacity-75">지정된 날짜에 공개하고 접수를 시작합니다.</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange('earlybird')}
                                className={`p-4 rounded-lg border text-left transition-all ${publishMode === 'earlybird' ? 'border-coral-500 bg-coral-50 text-coral-700' : 'border-slate-200 hover:border-coral-300'}`}
                            >
                                <div className="font-bold">🐣 얼리버드 (선배포)</div>
                                <div className="text-xs mt-1 opacity-75">지금 공개하지만, 강의 시작은 나중입니다.</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange('private')}
                                className={`p-4 rounded-lg border text-left transition-all ${publishMode === 'private' ? 'border-slate-500 bg-slate-100 text-slate-700' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <div className="font-bold">🔒 비공개 (초안)</div>
                                <div className="text-xs mt-1 opacity-75">나만 볼 수 있는 상태로 저장합니다.</div>
                            </button>
                        </div>

                        {/* 날짜 입력 필드 (조건부 렌더링) */}
                        {publishMode === 'scheduled' && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">오픈 예정일 (공개 및 시작)</label>
                                <input
                                    type="datetime-local"
                                    name="published_at"
                                    value={formData.published_at}
                                    onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value, start_date: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500"
                                    required
                                />
                            </div>
                        )}

                        {publishMode === 'earlybird' && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">강의 시작일 (수강 가능일)</label>
                                <input
                                    type="datetime-local"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-2">* 강의는 즉시 공개되지만, 실제 수강은 이 날짜부터 가능합니다.</p>
                            </div>
                        )}
                    </div>

                    {/* 썸네일 URL */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">썸네일 URL</label>
                        <input
                            type="text"
                            name="thumbnail_url"
                            value={formData.thumbnail_url}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500"
                            placeholder="예: /assets/images/courses/python.jpg"
                        />
                        <p className="text-xs text-slate-500 mt-1">파일 업로드 기능은 추후 구현 예정입니다. 관련 이미지 경로를 입력해주세요.</p>
                    </div>

                    {/* 설명 */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">강의 설명 상세</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-coral-500"
                            placeholder="강의에 대한 자세한 설명을 입력해주세요."
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-coral-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-coral-600 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? '등록 중...' : '강의 등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
