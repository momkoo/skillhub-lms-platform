import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getBlockedIPs, unblockIP } from '@/lib/security';

/**
 * Admin API: 차단된 IP 관리
 * 
 * GET - 차단된 IP 목록 조회
 * DELETE - IP 차단 해제
 */

export async function GET(request: Request) {
    const supabase = await createClient();

    // 관리자 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('skillhub_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 차단된 IP 목록 반환
    const blockedIPs = getBlockedIPs();

    return NextResponse.json({
        count: blockedIPs.length,
        blocked: blockedIPs.map(item => ({
            ip: item.ip,
            attempts: item.attempts,
            blockedUntil: item.blockedUntil.toISOString(),
            remainingMinutes: Math.max(0, Math.round((item.blockedUntil.getTime() - Date.now()) / 60000))
        }))
    });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();

    // 관리자 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('skillhub_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');

    if (!ip) {
        return NextResponse.json({ error: 'IP 주소가 필요합니다.' }, { status: 400 });
    }

    const success = unblockIP(ip);

    if (success) {
        return NextResponse.json({ success: true, message: `${ip} 차단이 해제되었습니다.` });
    } else {
        return NextResponse.json({ error: '해당 IP가 차단 목록에 없습니다.' }, { status: 404 });
    }
}
