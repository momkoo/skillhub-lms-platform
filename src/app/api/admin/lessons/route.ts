import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST: 레슨 생성
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { course_id, title, section_title, duration_minutes, is_free, order_index } = body;

        const supabase = await createClient();
        const { error } = await supabase
            .from('skillhub_lessons')
            .insert([{
                course_id,
                title,
                section_title: section_title || '섹션 1',
                duration_minutes: Number(duration_minutes) || 0,
                is_free: is_free || false,
                order_index: order_index || 0
            }]);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: 레슨 수정
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, section_title, duration_minutes, is_free, order_index } = body;

        const supabase = await createClient();
        const { error } = await supabase
            .from('skillhub_lessons')
            .update({
                title,
                section_title,
                duration_minutes,
                is_free,
                order_index
            })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: 레슨 삭제
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const supabase = await createClient();
        const { error } = await supabase
            .from('skillhub_lessons')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
