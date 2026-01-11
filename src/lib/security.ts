/**
 * Security Utilities - Rate Limiting & IP Blocking
 * 
 * 기능:
 * - 의심스러운 요청 감지
 * - 3회 경고 후 IP 차단
 * - 차단 해제 시간 설정
 */

// In-memory store (프로덕션에서는 Redis 권장)
const suspiciousIPs = new Map<string, { count: number; lastAttempt: Date; blocked: boolean; blockedUntil?: Date }>();

// 설정
const CONFIG = {
    MAX_WARNINGS: 3,           // 경고 횟수
    BLOCK_DURATION_MS: 60 * 60 * 1000, // 차단 시간 (1시간)
    CLEANUP_INTERVAL_MS: 10 * 60 * 1000, // 정리 주기 (10분)
};

// 의심스러운 패턴 감지
const SUSPICIOUS_PATTERNS = [
    /<script[\s\S]*?>/i,                    // XSS 시도
    /javascript:/i,                          // javascript: 프로토콜
    /on\w+\s*=/i,                           // 이벤트 핸들러 (onclick=, onload= 등)
    /union\s+select/i,                       // SQL Injection
    /;\s*drop\s+table/i,                    // SQL Injection
    /--\s*$/,                               // SQL 주석
    /'\s*or\s+'1'\s*=\s*'1/i,               // SQL Injection
    /\.\.\//g,                               // 디렉토리 탐색
    /<iframe/i,                              // iframe 삽입
    /<object/i,                              // object 삽입
    /<embed/i,                               // embed 삽입
    /base64/i,                               // Base64 인코딩 시도
];

/**
 * 입력값이 의심스러운지 검사
 */
export function isSuspiciousInput(input: string): { suspicious: boolean; reason?: string } {
    if (!input || typeof input !== 'string') return { suspicious: false };

    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(input)) {
            return {
                suspicious: true,
                reason: `Suspicious pattern detected: ${pattern.toString()}`
            };
        }
    }

    // 비정상적으로 긴 입력
    if (input.length > 50000) {
        return { suspicious: true, reason: 'Input too long' };
    }

    return { suspicious: false };
}

/**
 * IP 주소의 현재 상태 확인
 */
export function getIPStatus(ip: string): {
    blocked: boolean;
    warnings: number;
    blockedUntil?: Date;
    message?: string;
} {
    const record = suspiciousIPs.get(ip);

    if (!record) {
        return { blocked: false, warnings: 0 };
    }

    // 차단 해제 시간 확인
    if (record.blocked && record.blockedUntil) {
        if (new Date() > record.blockedUntil) {
            // 차단 해제
            suspiciousIPs.delete(ip);
            return { blocked: false, warnings: 0 };
        }
        return {
            blocked: true,
            warnings: record.count,
            blockedUntil: record.blockedUntil,
            message: `IP 차단됨. ${record.blockedUntil.toLocaleString('ko-KR')}까지 접근 불가`
        };
    }

    return {
        blocked: false,
        warnings: record.count,
        message: record.count > 0
            ? `경고 ${record.count}/${CONFIG.MAX_WARNINGS}회. ${CONFIG.MAX_WARNINGS - record.count}회 더 적발 시 차단됩니다.`
            : undefined
    };
}

/**
 * 의심스러운 활동 기록
 */
export function recordSuspiciousActivity(ip: string): {
    blocked: boolean;
    warnings: number;
    message: string;
} {
    const record = suspiciousIPs.get(ip) || { count: 0, lastAttempt: new Date(), blocked: false };

    record.count += 1;
    record.lastAttempt = new Date();

    // 3회 이상이면 차단
    if (record.count >= CONFIG.MAX_WARNINGS) {
        record.blocked = true;
        record.blockedUntil = new Date(Date.now() + CONFIG.BLOCK_DURATION_MS);
        suspiciousIPs.set(ip, record);

        console.warn(`[SECURITY] IP BLOCKED: ${ip} - ${record.count} suspicious attempts`);

        return {
            blocked: true,
            warnings: record.count,
            message: `⛔ 보안 정책 위반으로 IP가 차단되었습니다. ${record.blockedUntil.toLocaleString('ko-KR')}까지 접근이 제한됩니다.`
        };
    }

    suspiciousIPs.set(ip, record);

    console.warn(`[SECURITY] Suspicious activity from ${ip}: Warning ${record.count}/${CONFIG.MAX_WARNINGS}`);

    return {
        blocked: false,
        warnings: record.count,
        message: `⚠️ 경고 ${record.count}/${CONFIG.MAX_WARNINGS}: 의심스러운 활동이 감지되었습니다. ${CONFIG.MAX_WARNINGS - record.count}회 더 적발 시 IP가 차단됩니다.`
    };
}

/**
 * IP 차단 여부 확인 (미들웨어용)
 */
export function isIPBlocked(ip: string): boolean {
    const status = getIPStatus(ip);
    return status.blocked;
}

/**
 * 차단된 IP 목록 조회 (관리자용)
 */
export function getBlockedIPs(): Array<{ ip: string; blockedUntil: Date; attempts: number }> {
    const blocked: Array<{ ip: string; blockedUntil: Date; attempts: number }> = [];

    suspiciousIPs.forEach((record, ip) => {
        if (record.blocked && record.blockedUntil) {
            blocked.push({
                ip,
                blockedUntil: record.blockedUntil,
                attempts: record.count
            });
        }
    });

    return blocked;
}

/**
 * IP 차단 해제 (관리자용)
 */
export function unblockIP(ip: string): boolean {
    if (suspiciousIPs.has(ip)) {
        suspiciousIPs.delete(ip);
        console.log(`[SECURITY] IP unblocked by admin: ${ip}`);
        return true;
    }
    return false;
}

// 주기적 정리 (오래된 기록 삭제)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = new Date();
        suspiciousIPs.forEach((record, ip) => {
            // 차단 해제된 IP 정리
            if (record.blockedUntil && now > record.blockedUntil) {
                suspiciousIPs.delete(ip);
            }
            // 24시간 이상 활동 없는 IP 정리
            const hoursSinceLastAttempt = (now.getTime() - record.lastAttempt.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastAttempt > 24 && !record.blocked) {
                suspiciousIPs.delete(ip);
            }
        });
    }, CONFIG.CLEANUP_INTERVAL_MS);
}
