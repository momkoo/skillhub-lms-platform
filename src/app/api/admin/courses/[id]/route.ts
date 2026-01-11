import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;
        const supabase = await createClient();

        // 관리자 권한 확인 (보안)
        const { data: { user: adminUser } } = await supabase.auth.getUser();
        if (!adminUser) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const { error } = await supabase
            .from('skillhub_courses')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
