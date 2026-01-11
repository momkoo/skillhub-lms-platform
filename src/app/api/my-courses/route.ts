import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Enrollments with Course details
        const { data, error } = await supabase
            .from('skillhub_enrollments')
            .select(`
                id,
                enrolled_at,
                status,
                course:skillhub_courses(
                    id,
                    title,
                    slug,
                    thumbnail_url,
                    lesson_count,
                    instructor:skillhub_instructors(name)
                )
            `)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('enrolled_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('My Courses Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
