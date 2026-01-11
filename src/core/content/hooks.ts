// ============================================
// Core: 콘텐츠 관리 - React Hooks
// ============================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { 
  PostPublic, 
  CategoryPublic, 
  TagPublic, 
  CommentPublic,
  PostFilters, 
  PostCreateInput, 
  PostUpdateInput,
  CategoryCreateInput,
  CategoryUpdateInput,
  TagCreateInput,
  CommentCreateInput,
  ContentStats,
  PaginatedPosts
} from './types';

// API 함수
const api = {
  // Posts
  async getPosts(filters: PostFilters): Promise<PaginatedPosts> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const res = await fetch(`/api/posts?${params.toString()}`);
    if (!res.ok) throw new Error('포스트 목록을 가져올 수 없습니다.');
    return res.json();
  },

  async getPost(id: string): Promise<PostPublic> {
    const res = await fetch(`/api/posts/${id}`);
    if (!res.ok) throw new Error('포스트를 가져올 수 없습니다.');
    return res.json();
  },

  async getPostBySlug(slug: string): Promise<PostPublic> {
    const res = await fetch(`/api/posts/slug/${slug}`);
    if (!res.ok) throw new Error('포스트를 가져올 수 없습니다.');
    return res.json();
  },

  async createPost(data: PostCreateInput): Promise<PostPublic> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '포스트 생성에 실패했습니다.');
    }
    return res.json();
  },

  async updatePost(id: string, data: PostUpdateInput): Promise<PostPublic> {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '포스트 업데이트에 실패했습니다.');
    }
    return res.json();
  },

  async deletePost(id: string): Promise<void> {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '포스트 삭제에 실패했습니다.');
    }
  },

  async publishPost(id: string): Promise<PostPublic> {
    const res = await fetch(`/api/posts/${id}/publish`, { method: 'POST' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '포스트 게시에 실패했습니다.');
    }
    return res.json();
  },

  async unpublishPost(id: string): Promise<PostPublic> {
    const res = await fetch(`/api/posts/${id}/unpublish`, { method: 'POST' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '포스트 게시 해제에 실패했습니다.');
    }
    return res.json();
  },

  // Categories
  async getCategories(): Promise<CategoryPublic[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('카테고리 목록을 가져올 수 없습니다.');
    return res.json();
  },

  async createCategory(data: CategoryCreateInput): Promise<CategoryPublic> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '카테고리 생성에 실패했습니다.');
    }
    return res.json();
  },

  async updateCategory(id: string, data: CategoryUpdateInput): Promise<CategoryPublic> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '카테고리 업데이트에 실패했습니다.');
    }
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '카테고리 삭제에 실패했습니다.');
    }
  },

  // Tags
  async getTags(): Promise<TagPublic[]> {
    const res = await fetch('/api/tags');
    if (!res.ok) throw new Error('태그 목록을 가져올 수 없습니다.');
    return res.json();
  },

  async createTag(data: TagCreateInput): Promise<TagPublic> {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '태그 생성에 실패했습니다.');
    }
    return res.json();
  },

  async deleteTag(id: string): Promise<void> {
    const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '태그 삭제에 실패했습니다.');
    }
  },

  // Comments
  async getComments(postId?: string): Promise<CommentPublic[]> {
    const params = postId ? `?postId=${postId}` : '';
    const res = await fetch(`/api/comments${params}`);
    if (!res.ok) throw new Error('댓글 목록을 가져올 수 없습니다.');
    return res.json();
  },

  async createComment(data: CommentCreateInput): Promise<CommentPublic> {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '댓글 작성에 실패했습니다.');
    }
    return res.json();
  },

  async approveComment(id: string): Promise<CommentPublic> {
    const res = await fetch(`/api/comments/${id}/approve`, { method: 'POST' });
    if (!res.ok) throw new Error('댓글 승인에 실패했습니다.');
    return res.json();
  },

  async deleteComment(id: string): Promise<void> {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('댓글 삭제에 실패했습니다.');
  },

  // Stats
  async getContentStats(): Promise<ContentStats> {
    const res = await fetch('/api/posts/stats');
    if (!res.ok) throw new Error('통계를 가져올 수 없습니다.');
    return res.json();
  },
};

// ============================================
// Posts Hook (포스트 관리)
// ============================================

interface UsePostsReturn {
  posts: PostPublic[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: PostFilters;
  setFilters: (filters: PostFilters) => void;
  refresh: () => Promise<void>;
  createPost: (data: PostCreateInput) => Promise<PostPublic>;
  updatePost: (id: string, data: PostUpdateInput) => Promise<PostPublic>;
  deletePost: (id: string) => Promise<void>;
  publishPost: (id: string) => Promise<PostPublic>;
  unpublishPost: (id: string) => Promise<PostPublic>;
}

export function usePosts(initialFilters?: PostFilters): UsePostsReturn {
  const [posts, setPosts] = useState<PostPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PostFilters>(initialFilters || {});

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPosts(filters);
      setPosts(data.posts);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const setFilters = useCallback((newFilters: PostFilters) => {
    setFiltersState(newFilters);
  }, []);

  const createPostFn = useCallback(async (data: PostCreateInput) => {
    const post = await api.createPost(data);
    await fetchPosts();
    return post;
  }, [fetchPosts]);

  const updatePostFn = useCallback(async (id: string, data: PostUpdateInput) => {
    const post = await api.updatePost(id, data);
    await fetchPosts();
    return post;
  }, [fetchPosts]);

  const deletePostFn = useCallback(async (id: string) => {
    await api.deletePost(id);
    await fetchPosts();
  }, [fetchPosts]);

  const publishPostFn = useCallback(async (id: string) => {
    const post = await api.publishPost(id);
    await fetchPosts();
    return post;
  }, [fetchPosts]);

  const unpublishPostFn = useCallback(async (id: string) => {
    const post = await api.unpublishPost(id);
    await fetchPosts();
    return post;
  }, [fetchPosts]);

  return {
    posts,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchPosts,
    createPost: createPostFn,
    updatePost: updatePostFn,
    deletePost: deletePostFn,
    publishPost: publishPostFn,
    unpublishPost: unpublishPostFn,
  };
}

// ============================================
// Categories Hook (카테고리 관리)
// ============================================

interface UseCategoriesReturn {
  categories: CategoryPublic[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createCategory: (data: CategoryCreateInput) => Promise<CategoryPublic>;
  updateCategory: (id: string, data: CategoryUpdateInput) => Promise<CategoryPublic>;
  deleteCategory: (id: string) => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategoryFn = useCallback(async (data: CategoryCreateInput) => {
    const category = await api.createCategory(data);
    await fetchCategories();
    return category;
  }, [fetchCategories]);

  const updateCategoryFn = useCallback(async (id: string, data: CategoryUpdateInput) => {
    const category = await api.updateCategory(id, data);
    await fetchCategories();
    return category;
  }, [fetchCategories]);

  const deleteCategoryFn = useCallback(async (id: string) => {
    await api.deleteCategory(id);
    await fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
    createCategory: createCategoryFn,
    updateCategory: updateCategoryFn,
    deleteCategory: deleteCategoryFn,
  };
}

// ============================================
// Tags Hook (태그 관리)
// ============================================

interface UseTagsReturn {
  tags: TagPublic[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTag: (data: TagCreateInput) => Promise<TagPublic>;
  deleteTag: (id: string) => Promise<void>;
}

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<TagPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTagFn = useCallback(async (data: TagCreateInput) => {
    const tag = await api.createTag(data);
    await fetchTags();
    return tag;
  }, [fetchTags]);

  const deleteTagFn = useCallback(async (id: string) => {
    await api.deleteTag(id);
    await fetchTags();
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    error,
    refresh: fetchTags,
    createTag: createTagFn,
    deleteTag: deleteTagFn,
  };
}

// ============================================
// Comments Hook (댓글 관리)
// ============================================

interface UseCommentsReturn {
  comments: CommentPublic[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createComment: (data: CommentCreateInput) => Promise<CommentPublic>;
  approveComment: (id: string) => Promise<CommentPublic>;
  deleteComment: (id: string) => Promise<void>;
}

export function useComments(postId?: string): UseCommentsReturn {
  const [comments, setComments] = useState<CommentPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getComments(postId);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createCommentFn = useCallback(async (data: CommentCreateInput) => {
    const comment = await api.createComment(data);
    await fetchComments();
    return comment;
  }, [fetchComments]);

  const approveCommentFn = useCallback(async (id: string) => {
    const comment = await api.approveComment(id);
    await fetchComments();
    return comment;
  }, [fetchComments]);

  const deleteCommentFn = useCallback(async (id: string) => {
    await api.deleteComment(id);
    await fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    refresh: fetchComments,
    createComment: createCommentFn,
    approveComment: approveCommentFn,
    deleteComment: deleteCommentFn,
  };
}

// ============================================
// Content Stats Hook (콘텐츠 통계)
// ============================================

export function useContentStats() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getContentStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh: fetchStats };
}
