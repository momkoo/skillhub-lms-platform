// ============================================
// Core: 콘텐츠 관리 - 타입 정의
// ============================================

// Note: Prisma types removed - using Supabase instead

// 프론트엔드에서 사용할 포스트 타입
export interface PostPublic {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  status: PostStatus;
  type: PostType;
  visibility: Visibility;

  categoryId: string | null;
  category: CategoryPublic | null;
  tags: TagPublic[];

  authorId: string;
  author: {
    id: string;
    displayName: string;
    avatar: string | null;
  };

  viewCount: number;
  likeCount: number;

  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryPublic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent: CategoryPublic | null;
  children: CategoryPublic[];
  postCount: number;
}

export interface TagPublic {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface CommentPublic {
  id: string;
  content: string;
  authorId: string | null;
  author: {
    id: string;
    displayName: string;
    avatar: string | null;
  } | null;
  parentId: string | null;
  replies: CommentPublic[];
  isApproved: boolean;
  createdAt: Date;
}

export type PostStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
export type PostType = 'POST' | 'PAGE' | 'ANNOUNCEMENT';
export type Visibility = 'PUBLIC' | 'PRIVATE' | 'PASSWORD' | 'MEMBERS';

// API 응답 타입
export interface PaginatedPosts {
  posts: PostPublic[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PostFilters {
  search?: string;
  status?: PostStatus;
  type?: PostType;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// 포스트 생성/수정
export interface PostCreateInput {
  title: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  status?: PostStatus;
  type?: PostType;
  visibility?: Visibility;
  password?: string;
  categoryId?: string;
  tagIds?: string[];
  publishedAt?: Date;
  scheduledAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface PostUpdateInput extends Partial<PostCreateInput> { }

// 카테고리 생성/수정
export interface CategoryCreateInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  order?: number;
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {
  isActive?: boolean;
}

// 태그 생성
export interface TagCreateInput {
  name: string;
  slug?: string;
}

// 댓글 생성
export interface CommentCreateInput {
  content: string;
  postId: string;
  parentId?: string;
}

// 대시보드 통계
export interface ContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalTags: number;
  totalComments: number;
  pendingComments: number;
  topPosts: {
    id: string;
    title: string;
    viewCount: number;
  }[];
}
