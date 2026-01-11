import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        const supabaseAdmin = createAdminClient();

        // 1. Fetch Payments with Course details
        const { data: payments, error, count } = await supabaseAdmin
            .from('skillhub_payments')
            .select(`
                *,
                skillhub_courses (
                    title,
                    price
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // 2. Combine with User Data (Emails)
        // Since we cannot join auth.users directly, we fetch user details for this page
        // or for better performance, we could assume we just need the IDs, but for Admin, Email is better.
        // We will fetch user info for the unique user_ids in this page.

        const userIds = Array.from(new Set(payments.map(p => p.user_id).filter(Boolean)));

        // Fetch users in parallel (or use listUsers if fewer than 50, but getUserById is safer for specific set)
        // Note: supabaseAdmin.auth.admin.listUsers() doesn't support "in array" filter easily.
        // We'll just map over them. For 20 items, 20 requests is too many.
        // Optimization: Use a map if we had a profile table. 
        // Fallback: Just return IDs for now, or fetch a batch of users if possible.
        // Actually, let's try to get users via mapping. For MVP 20 items is okay to Promise.all if needed,
        // BUT better properly:

        const paymentsWithUsers = await Promise.all(payments.map(async (payment) => {
            let email = 'Unknown';
            let name = 'Unknown';

            if (payment.user_id) {
                const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(payment.user_id);
                if (user) {
                    email = user.email || 'No Email';
                    name = user.user_metadata?.full_name || user.user_metadata?.name || 'No Name';
                }
            }

            return {
                ...payment,
                user_email: email,
                user_name: name
            };
        }));

        return NextResponse.json({
            data: paymentsWithUsers,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error: any) {
        console.error('Admin Orders Fetch Error:', error);
        return NextResponse.json({ error: '주문 내역을 불러오는데 실패했습니다.' }, { status: 500 });
    }
}
