import Header from '@/components/layout/Header';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                {children}
            </main>
        </div>
    );
}
