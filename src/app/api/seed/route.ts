import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const supabase = await createClient();

        // 1. Seed Categories
        const categories = [
            { id: '10000000-0000-0000-0000-000000000001', name: '프로그래밍', description: 'Python, JavaScript, React 등' },
            { id: '10000000-0000-0000-0000-000000000002', name: '데이터 & AI', description: '데이터 분석, 머신러닝' },
            { id: '10000000-0000-0000-0000-000000000003', name: '디자인', description: 'UI/UX, 그래픽, Figma' },
            { id: '10000000-0000-0000-0000-000000000004', name: '비즈니스', description: '마케팅, 창업, 기획' },
            { id: '10000000-0000-0000-0000-000000000005', name: '영상/사진', description: '영상제작, 포토샵' },
            { id: '10000000-0000-0000-0000-000000000006', name: '외국어', description: '영어, 중국어, 일본어' },
            { id: '10000000-0000-0000-0000-000000000007', name: '부동산/재테크', description: '투자, 재무설계' },
        ];

        const { error: catError } = await supabase
            .from('skillhub_categories')
            .upsert(categories, { onConflict: 'id' });

        if (catError) throw catError;

        // 2. Seed Default Instructor
        const instructor = {
            id: 'e6a8d052-0943-426c-9c04-58531e217277',
            name: '김메타',
            specialty: '풀스택 개발자',
            bio: '10년차 개발자입니다. 쉽고 재미있게 가르쳐드립니다.',
            avatar_url: '/assets/images/instructors/instructor-1.jpg'
        };

        const { error: instError } = await supabase
            .from('skillhub_instructors')
            .upsert(instructor, { onConflict: 'id' });

        if (instError) throw instError;

        return NextResponse.json({ success: true, message: 'Seeding completed' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
