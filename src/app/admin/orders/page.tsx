'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminOrdersPage() {
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    // Fetch Orders
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-orders', page],
        queryFn: async () => {
            const res = await fetch(`/api/admin/orders?page=${page}&limit=10`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        }
    });

    // Refund Mutation
    const refundMutation = useMutation({
        mutationFn: async ({ merchant_uid, reason }: { merchant_uid: string, reason: string }) => {
            if (!confirm('정말로 이 결제를 취소(환불)하시겠습니까?')) return;

            const res = await fetch('/api/payment/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ merchant_uid, reason })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || '환불 실패');
            return result;
        },
        onSuccess: (result) => {
            alert(result.message || '환불 처리되었습니다.');
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        },
        onError: (err: any) => {
            alert(err.message);
        }
    });

    const handleRefund = (merchant_uid: string) => {
        const reason = prompt('환불 사유를 입력해주세요 (선택):') || '관리자 직권 취소';
        refundMutation.mutate({ merchant_uid, reason });
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">주문 정보를 불러오는 중...</div>;
    if (error) return <div className="p-8 text-center text-red-500">에러가 발생했습니다: {(error as any).message}</div>;

    const orders = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">주문 관리</h1>
                <span className="text-sm text-slate-500">총 {pagination?.total}건</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">주문번호</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">고객</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">강의명</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">금액</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">상태</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">결제일</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                    주문 내역이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                        {order.merchant_uid}
                                        <br />
                                        <span className="opacity-50">{order.payment_id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{order.user_name}</div>
                                        <div className="text-xs text-slate-500">{order.user_email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 line-clamp-1">
                                        {order.skillhub_courses?.title || 'Unknown Course'}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {order.amount.toLocaleString()}원
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                order.status === 'cancelled' ? 'bg-slate-100 text-slate-600 line-through' :
                                                    'bg-yellow-100 text-yellow-800'}
                                        `}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {new Date(order.created_at).toLocaleDateString()}
                                        <br />
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.status === 'paid' && (
                                            <button
                                                onClick={() => handleRefund(order.merchant_uid)}
                                                disabled={refundMutation.isPending}
                                                className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                                            >
                                                환불
                                            </button>
                                        )}
                                        {order.status === 'cancelled' && (
                                            <span className="text-xs text-slate-400">환불됨</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Setup */}
            <div className="flex justify-center gap-2 mt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="px-3 py-1">{page} / {pagination?.totalPages || 1}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= (pagination?.totalPages || 1)}
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
