/**
 * Input Validation & Sanitization Utilities
 * 
 * 사용자 입력 검증 및 정제
 */

// ============================================
// 문자열 정제 (Sanitize)
// ============================================

/**
 * HTML 태그 제거
 */
export function stripHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/<[^>]*>/g, '');
}

/**
 * 특수문자 이스케이프
 */
export function escapeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * 안전한 텍스트로 변환 (HTML 제거 + 트림 + 길이 제한)
 */
export function sanitizeText(input: string, maxLength: number = 10000): string {
    if (!input || typeof input !== 'string') return '';
    return stripHtml(input).trim().slice(0, maxLength);
}

// ============================================
// 입력 검증 (Validate)
// ============================================

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * 이메일 검증
 */
export function validateEmail(email: string): ValidationResult {
    if (!email) return { valid: false, error: '이메일을 입력해주세요.' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: '올바른 이메일 형식이 아닙니다.' };
    }

    if (email.length > 255) {
        return { valid: false, error: '이메일이 너무 깁니다.' };
    }

    return { valid: true };
}

/**
 * 닉네임 검증
 */
export function validateNickname(nickname: string): ValidationResult {
    if (!nickname) return { valid: false, error: '닉네임을 입력해주세요.' };

    if (nickname.length < 2) {
        return { valid: false, error: '닉네임은 2자 이상이어야 합니다.' };
    }

    if (nickname.length > 20) {
        return { valid: false, error: '닉네임은 20자 이하여야 합니다.' };
    }

    // 허용 문자: 한글, 영문, 숫자, 언더스코어
    const nicknameRegex = /^[가-힣a-zA-Z0-9_]+$/;
    if (!nicknameRegex.test(nickname)) {
        return { valid: false, error: '닉네임은 한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.' };
    }

    return { valid: true };
}

/**
 * 비밀번호 검증
 */
export function validatePassword(password: string): ValidationResult {
    if (!password) return { valid: false, error: '비밀번호를 입력해주세요.' };

    if (password.length < 8) {
        return { valid: false, error: '비밀번호는 8자 이상이어야 합니다.' };
    }

    if (password.length > 100) {
        return { valid: false, error: '비밀번호가 너무 깁니다.' };
    }

    // 최소 조건: 문자 + 숫자
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return { valid: false, error: '비밀번호는 영문과 숫자를 모두 포함해야 합니다.' };
    }

    return { valid: true };
}

/**
 * 게시글 제목 검증
 */
export function validateTitle(title: string): ValidationResult {
    if (!title) return { valid: false, error: '제목을 입력해주세요.' };

    const sanitized = sanitizeText(title, 200);

    if (sanitized.length < 2) {
        return { valid: false, error: '제목은 2자 이상이어야 합니다.' };
    }

    if (sanitized.length > 200) {
        return { valid: false, error: '제목은 200자 이하여야 합니다.' };
    }

    return { valid: true };
}

/**
 * 게시글/댓글 내용 검증
 */
export function validateContent(content: string, maxLength: number = 50000): ValidationResult {
    if (!content) return { valid: false, error: '내용을 입력해주세요.' };

    if (content.length < 1) {
        return { valid: false, error: '내용을 입력해주세요.' };
    }

    if (content.length > maxLength) {
        return { valid: false, error: `내용은 ${maxLength.toLocaleString()}자 이하여야 합니다.` };
    }

    return { valid: true };
}

/**
 * UUID 검증
 */
export function validateUUID(uuid: string): ValidationResult {
    if (!uuid) return { valid: false, error: '유효하지 않은 ID입니다.' };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
        return { valid: false, error: '유효하지 않은 ID 형식입니다.' };
    }

    return { valid: true };
}

/**
 * 숫자 범위 검증
 */
export function validateNumberRange(
    value: number,
    min: number,
    max: number,
    fieldName: string = '값'
): ValidationResult {
    if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: `${fieldName}이(가) 유효하지 않습니다.` };
    }

    if (value < min) {
        return { valid: false, error: `${fieldName}은(는) ${min} 이상이어야 합니다.` };
    }

    if (value > max) {
        return { valid: false, error: `${fieldName}은(는) ${max} 이하여야 합니다.` };
    }

    return { valid: true };
}

// ============================================
// 파일 업로드 검증
// ============================================

export interface FileValidationOptions {
    maxSize?: number;           // 바이트 단위
    allowedTypes?: string[];    // MIME 타입
    allowedExtensions?: string[]; // 확장자
}

const DEFAULT_FILE_OPTIONS: FileValidationOptions = {
    maxSize: 10 * 1024 * 1024,  // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

export function validateFile(
    file: { name: string; size: number; type: string },
    options: FileValidationOptions = DEFAULT_FILE_OPTIONS
): ValidationResult {
    const { maxSize, allowedTypes, allowedExtensions } = { ...DEFAULT_FILE_OPTIONS, ...options };

    // 파일 크기 검사
    if (maxSize && file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return { valid: false, error: `파일 크기는 ${sizeMB}MB 이하여야 합니다.` };
    }

    // MIME 타입 검사
    if (allowedTypes && !allowedTypes.includes(file.type)) {
        return { valid: false, error: `허용되지 않는 파일 형식입니다. (${allowedTypes.join(', ')})` };
    }

    // 확장자 검사
    if (allowedExtensions) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            return { valid: false, error: `허용되지 않는 확장자입니다. (${allowedExtensions.join(', ')})` };
        }
    }

    return { valid: true };
}
