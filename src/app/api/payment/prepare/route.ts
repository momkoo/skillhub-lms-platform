import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json(); // Read once
        const { courseId } = body;
        console.log(`[Payment Prepare] Request details:`, { courseId });

        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('[Payment Prepare] Auth Failed:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log(`[Payment Prepare] User Authenticated: ${user.id}`);

        // 1.5 Check if already enrolled
        const { data: existingEnrollment } = await supabase
            .from('skillhub_enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single();

        if (existingEnrollment) {
            return NextResponse.json({ error: '이미 수강 중인 강의입니다.' }, { status: 409 });
        }

        // 2. Fetch Course Info
        let amount = 0;
        let courseTitle = 'Test Product';
        let course = null;

        if (courseId) {
            const { data: fetchCourse, error: courseError } = await supabase
                .from('skillhub_courses')
                .select('id, title, price')
                .eq('id', courseId)
                .single();

            if (courseError || !fetchCourse) {
                return NextResponse.json({ error: 'Course not found' }, { status: 404 });
            }
            course = fetchCourse;
            amount = course.price;
            courseTitle = course.title;
        } else {
            if (!body.totalAmount) {
                return NextResponse.json({ error: 'Course ID or Total Amount is required' }, { status: 400 });
            }
            amount = body.totalAmount;
            courseTitle = body.orderName || 'Generic Test Order';
        }

        // 3. Check for Existing Pending Payment (Resume Order)
        let merchantUid: string;

        const { data: existingPayment } = await supabase
            .from('skillhub_payments')
            .select('merchant_uid, amount')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false }) // Get most recent
            .limit(1)
            .single();

        if (existingPayment) {
            console.log(`[Payment Prepare] Resuming existing order: ${existingPayment.merchant_uid}`);
            merchantUid = existingPayment.merchant_uid;

            // Optional: Update amount if course price changed (not implemented here for safety)
        } else {
            // 4. Create New Merchant UID
            merchantUid = `ORD-${uuidv4()}`;

            // 5. Save Pending Payment to DB
            const { error: insertError } = await supabase
                .from('skillhub_payments')
                .insert({
                    user_id: user.id,
                    course_id: course?.id || null,
                    merchant_uid: merchantUid,
                    amount: amount,
                    status: 'pending',
                    payment_method: 'card'
                });

            if (insertError) throw insertError;
        }

        // Insert logic moved above

        console.log(`[Payment Prepare] Success: ${merchantUid}`);

        return NextResponse.json({
            merchantUid,
            amount: amount,
            name: courseTitle,
            buyer_email: user.email,
            buyer_name: user.user_metadata?.name || '구매자'
        });

    } catch (error: any) {
        console.error('Payment Prepare Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
