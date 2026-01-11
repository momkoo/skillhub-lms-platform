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

        // 2. Fetch Course Info (Price Source of Truth) OR Use Provided Amount (Test Mode)
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
                console.error('[Payment Prepare] Course Fetch Error:', courseError);
                return NextResponse.json({ error: 'Course not found' }, { status: 404 });
            }
            course = fetchCourse;
            amount = course.price;
            courseTitle = course.title;
            console.log(`[Payment Prepare] Course Found: ${course.title} (${course.price})`);
        } else {
            // For Generic Testing (e.g. from Payment Test Page)
            // Allow 'totalAmount' from body if courseId is missing
            if (!body.totalAmount) {
                return NextResponse.json({ error: 'Course ID or Total Amount is required' }, { status: 400 });
            }
            amount = body.totalAmount;
            courseTitle = body.orderName || 'Generic Test Order';
            console.log(`[Payment Prepare] Generic Order: ${courseTitle} (${amount})`);
        }

        // 3. Create Unique Merchant UID
        const merchantUid = `ORD-${uuidv4()}`;

        // 4. Save Pending Payment to DB
        const { error: insertError } = await supabase
            .from('skillhub_payments')
            .insert({
                user_id: user.id,
                course_id: course?.id || null, // Allow null for test orders
                merchant_uid: merchantUid,
                amount: amount,
                status: 'pending',
                payment_method: 'card' // Default, will update later
            });

        if (insertError) {
            console.error('[Payment Prepare] DB Insert Error:', insertError);
            throw insertError;
        }

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
