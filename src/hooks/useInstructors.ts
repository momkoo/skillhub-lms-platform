import { useQuery } from '@tanstack/react-query';

export interface Instructor {
    id: string;
    user_id: string | null;
    name: string;
    email: string;
    avatar_url: string;
    specialty: string;
    bio: string;
    total_students: number;
    total_courses: number;
    average_rating: number;
    is_verified: boolean;
}

async function fetchInstructors(): Promise<Instructor[]> {
    const res = await fetch('/api/instructors');
    if (!res.ok) throw new Error('Failed to fetch instructors');
    return res.json();
}

async function fetchInstructor(id: string): Promise<Instructor> {
    const res = await fetch(`/api/instructors/${id}`);
    if (!res.ok) throw new Error('Failed to fetch instructor');
    return res.json();
}

export function useInstructors() {
    return useQuery({
        queryKey: ['instructors'],
        queryFn: fetchInstructors,
    });
}

export function useInstructor(id: string) {
    return useQuery({
        queryKey: ['instructor', id],
        queryFn: () => fetchInstructor(id),
        enabled: !!id,
    });
}
