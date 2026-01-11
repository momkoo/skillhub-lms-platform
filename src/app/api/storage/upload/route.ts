import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { validateImageFile, generateSafeFileName } from '@/lib/storage';

export async function POST(request: Request) {
    const supabase = await createClient();

    // 1. 인증 체크
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'general';

        if (!file) {
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
        }

        // 2. 서버사이드 보안 검증 (MIME 타입, 크기)
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // 3. 파일명 난수화 (UUID/Timestamp 기반)
        const safeFileName = generateSafeFileName(file.name);
        // 경로 구조: uploads/[user_id]/[folder]/[safe_name]
        const filePath = `${user.id}/${folder}/${safeFileName}`;

        // 4. Supabase Storage 업로드
        const { data, error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type // MIME 타입 명시 강제
            });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // 5. 공개 URL 생성
        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            path: filePath,
            fileName: safeFileName
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: '파일 업로드 중 서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
