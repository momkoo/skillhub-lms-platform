import { useQuery } from '@tanstack/react-query';

export interface Category {
    id: string;
    name: string;
    description: string;
    count?: number; // Optional, might be calculated
    color: string;
    icon: string;
}

async function fetchCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
}

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });
}
