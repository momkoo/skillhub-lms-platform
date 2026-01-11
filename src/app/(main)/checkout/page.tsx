import { Suspense } from 'react';
import CheckoutContent from './CheckoutContent';

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
