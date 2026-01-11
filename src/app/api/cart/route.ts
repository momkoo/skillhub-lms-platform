import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ items: [] });
        }

        const { data, error } = await supabase
            .from('skillhub_cart_items')
            .select(`
                id,
                course:skillhub_courses(
                    id,
                    title,
                    price,
                    thumbnail_url,
                    slug,
                    instructor:skillhub_instructors(name)
                )
            `)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ items: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { courseId } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { error } = await supabase
            .from('skillhub_cart_items')
            .upsert({ user_id: user.id, course_id: courseId });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { courseId } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { error } = await supabase
            .from('skillhub_cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('course_id', courseId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
