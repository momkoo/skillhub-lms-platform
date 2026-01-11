import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isIPBlocked, isSuspiciousInput, recordSuspiciousActivity, getIPStatus } from '@/lib/security';

/**
 * Security Middleware
 * 
 * - IP 차단 확인
 * - 의심스러운 요청 감지
 * - 3회 경고 후 차단
 */
export function securityMiddleware(request: NextRequest): NextResponse | null {
    // IP 주소 추출
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

    // 1. 차단된 IP 확인
    if (isIPBlocked(ip)) {
        const status = getIPStatus(ip);
        return NextResponse.json(
            {
                error: '접근이 차단되었습니다.',
                message: status.message,
                blockedUntil: status.blockedUntil
            },
            { status: 403 }
        );
    }

    // 2. URL 파라미터 검사
    const url = request.url;
    const suspiciousUrl = isSuspiciousInput(url);
    if (suspiciousUrl.suspicious) {
        const result = recordSuspiciousActivity(ip);
        console.warn(`[SECURITY] Suspicious URL from ${ip}: ${url}`);

        if (result.blocked) {
            return NextResponse.json(
                { error: '보안 정책 위반으로 차단되었습니다.', message: result.message },
                { status: 403 }
            );
        }

        // 경고 포함 응답
        return NextResponse.json(
            { error: '잘못된 요청입니다.', warning: result.message },
            { status: 400 }
        );
    }

    // 3. 요청 통과
    return null; // null 반환 시 요청 계속 진행
}

/**
 * API Route에서 사용할 보안 검사 헬퍼
 */
export async function checkRequestSecurity(
    request: Request
): Promise<{ passed: boolean; response?: NextResponse; ip: string }> {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

    // IP 차단 확인
    if (isIPBlocked(ip)) {
        const status = getIPStatus(ip);
        return {
            passed: false,
            response: NextResponse.json(
                { error: '접근이 차단되었습니다.', message: status.message },
                { status: 403 }
            ),
            ip
        };
    }

    // POST/PUT/PATCH 요청의 body 검사
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
            const body = await request.clone().text();
            const suspicious = isSuspiciousInput(body);

            if (suspicious.suspicious) {
                const result = recordSuspiciousActivity(ip);
                console.warn(`[SECURITY] Suspicious body from ${ip}: ${suspicious.reason}`);

                return {
                    passed: false,
                    response: NextResponse.json(
                        {
                            error: result.blocked ? '보안 정책 위반으로 차단되었습니다.' : '잘못된 요청입니다.',
                            warning: result.message
                        },
                        { status: result.blocked ? 403 : 400 }
                    ),
                    ip
                };
            }
        } catch (e) {
            // body 파싱 실패는 무시
        }
    }

    return { passed: true, ip };
}

/**
 * 의심스러운 활동 수동 기록 (API에서 직접 호출용)
 */
export function flagSuspiciousRequest(request: Request, reason?: string): {
    blocked: boolean;
    message: string;
} {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

    console.warn(`[SECURITY] Manual flag from ${ip}: ${reason || 'No reason provided'}`);
    return recordSuspiciousActivity(ip);
}
