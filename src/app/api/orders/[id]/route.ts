import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params; // Next.js 16 await params
    try {
        const orderId = params.id;
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Order to check ownership and status
        const { data: order, error: fetchError } = await supabase
            .from('skillhub_payments')
            .select('user_id, status, merchant_uid')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Only allow cancelling 'pending' orders
        if (order.status !== 'pending') {
            return NextResponse.json({
                error: 'Only pending orders can be cancelled. Please contact support for refunds.'
            }, { status: 400 });
        }

        // 4. Update status to 'cancelled' (Soft Delete)
        // We don't DELETE the row to keep history, but for pending we could hard delete.
        // Let's use soft cancel for audit.
        const { error: updateError } = await supabase
            .from('skillhub_payments')
            .update({ status: 'cancelled' })
            .eq('id', orderId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: 'Order cancelled successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
