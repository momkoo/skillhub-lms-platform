import { useQuery } from '@tanstack/react-query';

export interface BoardCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface BoardPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnail_url?: string;
    view_count: number;
    like_count: number;
    comment_count: number;
    category_id: string;
    author_id: string;
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    created_at: string;
    published_at?: string;
    author?: {
        id: string;
        nickname: string;
        avatar_url: string;
    };
    category?: BoardCategory;
}

export interface BoardComment {
    id: string;
    post_id: string;
    user_id: string;
    author?: {
        id: string;
        nickname: string;
        avatar_url: string;
    };
    parent_id: string | null;
    content: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

interface UseBoardPostsOptions {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

async function fetchBoardCategories(): Promise<BoardCategory[]> {
    const res = await fetch('/api/board/categories');
    if (!res.ok) throw new Error('Failed to fetch board categories');
    return res.json();
}

async function fetchBoardPosts(options: UseBoardPostsOptions = {}): Promise<BoardPost[]> {
    const params = new URLSearchParams();
    if (options.category) params.set('category', options.category);
    if (options.search) params.set('search', options.search);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const res = await fetch(`/api/board/posts?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch board posts');
    return res.json();
}

async function fetchBoardPost(id: string): Promise<BoardPost> {
    const res = await fetch(`/api/board/posts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch board post');
    return res.json();
}

export function useBoardCategories() {
    return useQuery({
        queryKey: ['board-categories'],
        queryFn: fetchBoardCategories,
    });
}

export function useBoardPosts(options: UseBoardPostsOptions = {}) {
    return useQuery({
        queryKey: ['board-posts', options],
        queryFn: () => fetchBoardPosts(options),
    });
}

export function useBoardPost(id: string) {
    return useQuery({
        queryKey: ['board-post', id],
        queryFn: () => fetchBoardPost(id),
        enabled: !!id,
    });
}

// Comments
async function fetchBoardComments(postId: string): Promise<any[]> {
    const res = await fetch(`/api/board/posts/${postId}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
}

export function useBoardComments(postId: string) {
    return useQuery({
        queryKey: ['board-comments', postId],
        queryFn: () => fetchBoardComments(postId),
        enabled: !!postId,
    });
}

// Mutations (simplified for now - would use useMutation in production)
export async function toggleLike(postId: string) {
    const res = await fetch(`/api/board/posts/${postId}/likes`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle like');
    return res.json();
}

export async function createComment(postId: string, content: string, parentId?: string) {
    const res = await fetch(`/api/board/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parent_id: parentId }),
    });
    if (!res.ok) throw new Error('Failed to create comment');
    return res.json();
}

export async function createPost(data: any) {
    const res = await fetch('/api/board/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
}
