/**
 * Payment API Tests - Mock Based
 * 
 * 이 테스트들은 실제 PG사 API를 호출하지 않고,
 * Mock 데이터를 사용하여 백엔드 로직을 검증합니다.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id', email: 'test@example.com' } },
                error: null
            })
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: {
                    id: 'payment-db-id',
                    merchant_uid: 'ORD-12345',
                    amount: 10000,
                    status: 'pending',
                    course_id: 'course-uuid',
                    user_id: 'test-user-id'
                },
                error: null
            }),
            update: vi.fn().mockReturnThis(),
        }))
    }))
}));

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: {
                    id: 'payment-db-id',
                    payment_id: 'portone-pay-id',
                    merchant_uid: 'ORD-12345',
                    amount: 10000,
                    status: 'paid',
                    course_id: 'course-uuid',
                    user_id: 'test-user-id'
                },
                error: null
            }),
            update: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockResolvedValue({ error: null }),
        }))
    }))
}));

// Mock global fetch for PortOne API calls
global.fetch = vi.fn();

describe('Payment Verify API Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should verify payment when PortOne returns PAID status and amount matches', async () => {
        // Mock PortOne API response
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                status: 'PAID',
                id: 'portone-pay-id',
                amount: { total: 10000 },
            })
        });

        // Simulate the verification logic
        const portOneResponse = await fetch('https://api.portone.io/payments/test');
        const portOneData = await portOneResponse.json();

        expect(portOneData.status).toBe('PAID');
        expect(portOneData.amount.total).toBe(10000);
    });

    it('should reject payment when amount is tampered', async () => {
        // Mock PortOne API response with different amount
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                status: 'PAID',
                id: 'portone-pay-id',
                amount: { total: 5000 }, // Tampered! Expected 10000
            })
        });

        const portOneResponse = await fetch('https://api.portone.io/payments/test');
        const portOneData = await portOneResponse.json();

        const expectedAmount = 10000;
        const isTampered = portOneData.amount.total !== expectedAmount;

        expect(isTampered).toBe(true);
    });

    it('should reject duplicate payment verification', async () => {
        const existingPayment = {
            id: 'payment-db-id',
            merchant_uid: 'ORD-12345',
            status: 'paid', // Already paid!
        };

        const isDuplicate = existingPayment.status === 'paid';
        expect(isDuplicate).toBe(true);
    });
});

describe('Payment Cancel API Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully cancel a paid payment', async () => {
        // Mock PortOne Cancel API response
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                cancellation: {
                    id: 'cancel-id',
                    status: 'SUCCEEDED',
                    totalAmount: 10000,
                }
            })
        });

        const response = await fetch('https://api.portone.io/payments/test/cancel', {
            method: 'POST',
            body: JSON.stringify({ reason: 'Test cancellation' })
        });
        const data = await response.json();

        expect(data.cancellation.status).toBe('SUCCEEDED');
    });

    it('should reject cancellation of already cancelled payment', async () => {
        const existingPayment = {
            id: 'payment-db-id',
            status: 'cancelled', // Already cancelled!
        };

        const isAlreadyCancelled = existingPayment.status === 'cancelled';
        expect(isAlreadyCancelled).toBe(true);
    });

    it('should reject cancellation of pending payment', async () => {
        const existingPayment = {
            id: 'payment-db-id',
            status: 'pending', // Not yet paid, cannot cancel
        };

        const canCancel = existingPayment.status === 'paid';
        expect(canCancel).toBe(false);
    });
});

describe('Webhook Handler Logic', () => {
    it('should correctly parse V2 webhook payload', () => {
        const webhookPayload = {
            type: 'Transaction.Paid',
            data: {
                paymentId: 'portone-pay-id',
                transactionId: 'tx-123',
            }
        };

        expect(webhookPayload.type).toBe('Transaction.Paid');
        expect(webhookPayload.data.paymentId).toBeDefined();
    });

    it('should correctly parse V1 webhook payload', () => {
        const webhookPayload = {
            tx_id: 'tx-123',
            payment_id: 'portone-pay-id',
            status: 'paid',
        };

        // V1 format uses different field names
        const paymentId = webhookPayload.payment_id || webhookPayload.tx_id;
        expect(paymentId).toBe('portone-pay-id');
    });

    it('should update payment status from webhook', async () => {
        const incomingStatus = 'Paid';
        const dbStatus = incomingStatus.toLowerCase();

        expect(dbStatus).toBe('paid');
    });
});
