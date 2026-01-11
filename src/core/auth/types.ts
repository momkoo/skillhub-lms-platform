// ============================================
// Core: 인증 및 회원 관리 - 타입 정의
// ============================================

// Note: Prisma types removed - using Supabase instead

// 프론트엔드에서 사용할 타입 (민감한 정보 제외)
export interface UserPublic {
  id: string;
  email: string;
  username: string | null;
  displayName: string;
  avatar: string | null;
  role: {
    id: string;
    name: string;
  };
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
}

// UserWithPermissions - Prisma types inlined
export interface UserWithPermissions {
  id: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: {
      permission: {
        name: string;
        resource: string;
        action: string;
      };
    }[];
  };
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'BANNED';
export type UserRole = 'ADMIN' | 'MANAGER' | 'EDITOR' | 'USER';

// 인증 관련
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
  expiresAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// API 응답 타입
export interface PaginatedUsers {
  users: UserPublic[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  roleId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 권한 체크
export interface PermissionCheck {
  resource: string;
  action: string;
}

export interface SessionInfo {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
}
