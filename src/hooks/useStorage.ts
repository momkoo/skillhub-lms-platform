import { useState } from 'react';

interface UploadResult {
    url: string;
    path: string;
    fileName: string;
}

export function useStorage() {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File, folder: string = 'general'): Promise<UploadResult | null> => {
        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const res = await fetch('/api/storage/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '업로드 중 오류가 발생했습니다.');
            }

            return data;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadFile,
        isUploading,
        error,
        clearError: () => setError(null)
    };
}
