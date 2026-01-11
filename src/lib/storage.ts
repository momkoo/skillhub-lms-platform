/**
 * 파일 크기를 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 허용된 파일 타입 확인 (이미지 전용)
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 파일 유효성 검사
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { isValid: false, error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)' };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { isValid: false, error: `파일 크기가 너무 큽니다. (최대 ${formatFileSize(MAX_FILE_SIZE)})` };
    }
    return { isValid: true };
}

/**
 * 보안을 위한 고유 파일명 생성 (UUID 기반)
 */
export function generateSafeFileName(originalName: string): string {
    const extension = originalName.split('.').pop()?.toLowerCase() || 'bin';
    const randomString = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now();
    return `${timestamp}-${randomString}.${extension}`;
}

/**
 * 이미지 파일 여부 확인
 */
export function isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
}
