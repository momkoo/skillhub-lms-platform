import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: orders, error } = await supabase
            .from('skillhub_payments')
            .select(`
                *,
                course:skillhub_courses (
                    title
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { courseId, paymentId, amount, status } = await request.json();
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!courseId || !paymentId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Insert Enrollment
        console.log(`[Order API] Processing payment ${paymentId} for course ${courseId} by user ${user.id}`);

        const { error: enrollmentError } = await supabase
            .from('skillhub_enrollments')
            .insert({
                user_id: user.id,
                course_id: courseId,
                status: 'active',
                enrolled_at: new Date().toISOString()
            });

        if (enrollmentError) {
            // Check if already enrolled
            if (enrollmentError.code === '23505') { // Unique violation
                return NextResponse.json({ message: 'Already enrolled' });
            }
            throw enrollmentError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Order Creation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
