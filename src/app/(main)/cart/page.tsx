'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            setCartItems(data.items || []);
        } catch (error) {
            console.error('Fetch cart error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (courseId: string) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'DELETE',
                body: JSON.stringify({ courseId }),
            });
            if (res.ok) {
                setCartItems(prev => prev.filter(item => item.course.id !== courseId));
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
        }
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.course?.price || 0), 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-cream-50">
                <Header />
                <div className="pt-32 max-w-7xl mx-auto px-4 text-center">장바구니 로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-50">
            <Header />
            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">장바구니</h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <p className="text-slate-500 mb-6 text-lg">장바구니가 비어 있습니다.</p>
                        <Link href="/courses" className="bg-coral-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-coral-600 transition-colors">
                            강의 둘러보기
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4">
                                    <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image src={item.course.thumbnail_url} alt={item.course.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg mb-1">{item.course.title}</h3>
                                                <p className="text-sm text-slate-500">{item.course.instructor.name}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.course.id)}
                                                className="text-slate-400 hover:text-red-500 text-sm"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                        <div className="mt-2 font-bold text-coral-500 text-lg">
                                            ₩{item.course.price.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-32">
                                <h2 className="text-xl font-bold mb-6">결제 요약</h2>
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-slate-500">
                                        <span>선택된 강의 ({cartItems.length}개)</span>
                                        <span>₩{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex justify-between font-bold text-xl">
                                        <span>총 결제금액</span>
                                        <span className="text-coral-500">₩{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => alert('결제 단계는 곧 구현될 예정입니다. 지금은 강의 상세 페이지에서 바로 수강신청이 가능합니다!')}
                                    className="w-full bg-coral-500 text-white py-4 rounded-full font-bold text-lg hover:bg-coral-600 transition-colors"
                                >
                                    결제하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
