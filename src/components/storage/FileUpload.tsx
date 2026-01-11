'use client';

import { useState, useRef } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { validateImageFile, formatFileSize } from '@/lib/storage';
import Image from 'next/image';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    folder?: string;
    label?: string;
    previewUrl?: string;
}

export default function FileUpload({ onUploadComplete, folder = 'general', label = '이미지 업로드', previewUrl }: FileUploadProps) {
    const { uploadFile, isUploading, error, clearError } = useStorage();
    const [preview, setPreview] = useState<string | null>(previewUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 클라이언트 사이드 검증
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        // 미리보기 생성
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // 업로드 실행
        const result = await uploadFile(file, folder);
        if (result) {
            onUploadComplete(result.url);
        } else {
            setPreview(previewUrl || null); // 업로드 실패 시 원래 미리보기로 복구
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {label && <label className="block text-sm font-bold text-slate-700">{label}</label>}

            <div
                onClick={triggerFileInput}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden flex flex-col items-center justify-center min-h-[200px] ${isUploading ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-coral-400 hover:bg-coral-50/10'
                    }`}
            >
                {preview ? (
                    <div className="relative w-full h-full min-h-[200px]">
                        <Image src={preview} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold">변경하기</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center p-8 text-center text-slate-400">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-coral-100 group-hover:text-coral-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">클릭하거나 이미지를 드래그하세요</p>
                        <p className="text-xs mt-1">PNG, JPG, WEB P (최대 5MB)</p>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-xs font-bold text-coral-500">업로드 중...</span>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
            />

            {error && (
                <p className="text-xs text-red-500 font-medium">⚠️ {error}</p>
            )}
        </div>
    );
}
