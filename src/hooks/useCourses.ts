import { useQuery } from '@tanstack/react-query';

export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    short_description: string;
    thumbnail_url: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'all';
    price: number;
    original_price?: number;
    duration_hours: number;
    lesson_count: number;
    student_count: number;
    average_rating: number;
    review_count: number;
    is_featured: boolean;
    badge?: string;
    instructor: {
        id: string;
        name: string;
        avatar_url: string;
        specialty?: string;
    };
    category: {
        id: string;
        name: string;
        slug: string;
    };
    lessons?: {
        id: string;
        title: string;
        duration_minutes: number;
        section_title: string;
        order_index: number;
        is_free: boolean;
        video_url?: string;
        description?: string;
    }[];
}

interface UseCoursesOptions {
    category?: string;
    instructorId?: string;
    featured?: boolean;
    limit?: number;
}

async function fetchCourses(options: UseCoursesOptions = {}): Promise<Course[]> {
    const params = new URLSearchParams();
    if (options.category) params.set('category', options.category);
    if (options.instructorId) params.set('instructor', options.instructorId);
    if (options.featured) params.set('featured', 'true');
    if (options.limit) params.set('limit', options.limit.toString());

    const res = await fetch(`/api/courses?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
}

async function fetchCourse(id: string): Promise<Course> {
    const res = await fetch(`/api/courses/${id}`);
    if (!res.ok) throw new Error('Failed to fetch course');
    return res.json();
}

export function useCourses(options: UseCoursesOptions = {}) {
    return useQuery({
        queryKey: ['courses', options],
        queryFn: () => fetchCourses(options),
    });
}

export function useCourse(id: string) {
    return useQuery({
        queryKey: ['course', id],
        queryFn: () => fetchCourse(id),
        enabled: !!id,
    });
}
