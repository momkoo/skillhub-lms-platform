import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: courseId } = await params;
        const { lessonId } = await request.json();
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!lessonId) {
            return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
        }

        // 2. Get Current Enrollment
        const { data: enrollment, error: fetchError } = await supabase
            .from('skillhub_enrollments')
            .select('id, completed_lesson_ids, course:skillhub_courses(lesson_count)')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single();

        if (fetchError || !enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        // 3. Update Completed Lessons
        let completedIds: string[] = enrollment.completed_lesson_ids || [];

        // Add if not already completed
        if (!completedIds.includes(lessonId)) {
            completedIds.push(lessonId);
        } else {
            // If already completed, maybe toggle off? For now just keep it completed or return early.
            // We will return early if no change, but client might want confirmation.
        }

        // 4. Calculate Progress
        const courseData = Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course;
        const totalLessons = courseData?.lesson_count || 1; // Avoid division by zero
        const progress = Math.min(100, Math.round((completedIds.length / totalLessons) * 100));

        // 5. Update DB
        const { error: updateError } = await supabase
            .from('skillhub_enrollments')
            .update({
                completed_lesson_ids: completedIds,
                progress: progress,
                last_accessed_at: new Date().toISOString()
            })
            .eq('id', enrollment.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, progress, completed_lesson_ids: completedIds });

    } catch (error: any) {
        console.error('Progress Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
