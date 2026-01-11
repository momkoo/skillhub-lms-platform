import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');

    const clientOptions: any = {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet: any[]) {
                try {
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Server Component에서 호출 시 무시
                }
            },
        },
    };

    // Bearer 토큰이 헤더에 있는 경우 명시적으로 추가 (API 테스트 지원)
    if (authHeader) {
        clientOptions.global = {
            headers: {
                Authorization: authHeader,
            },
        };
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        clientOptions
    );
}
