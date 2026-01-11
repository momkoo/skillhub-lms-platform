'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            fetchOrders();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [authLoading, user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-50 text-green-600 border-green-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return '결제 완료';
            case 'pending': return '결제 대기';
            case 'cancelled': return '결제 취소';
            default: return status;
        }
    };

    const handleCancel = async (orderId: string) => {
        if (!confirm('정말로 주  취소하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('주문이 취소되었습니다.');
                fetchOrders(); // 목록 새로고침
            } else {
                const data = await res.json();
                alert(data.error || '취소 실패');
            }
        } catch (error) {
            alert('오류가 발생했습니다.');
        }
    };

    if (authLoading || loading) return <div className="p-10 text-center text-slate-500">로딩 중...</div>;
    if (!user) return <div className="p-10 text-center text-slate-500">로그인이 필요합니다.</div>;

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">주문 내역</h1>
            <p className="text-slate-500 mb-10">최근 결제하신 강의 주문 내역입니다.</p>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">주문일시 / 주문번호</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">주문상품</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">결제금액</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">상태</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-6 font-medium">
                                            <div className="text-sm text-slate-800">{new Date(order.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-400 mt-1">{order.merchant_uid}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-bold text-slate-800">{order.course?.title || '알 수 없는 강의'}</div>
                                            <div className="text-xs text-slate-400 mt-1">{order.payment_method === 'card' ? '카드 결제' : order.payment_method}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-sm font-bold text-slate-900">{order.amount.toLocaleString()}원</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancel(order.id)}
                                                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded transition-colors"
                                                >
                                                    주문 취소
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                        주문 내역이 존재하지 않습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Link href="/courses" className="text-coral-500 font-bold hover:underline">
                    새로운 강의 찾아보기 →
                </Link>
            </div>
        </div>
    );
}
