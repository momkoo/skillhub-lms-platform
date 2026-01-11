// ============================================
// Core: 인증 및 회원 관리 - React Hooks
// ============================================

'use client';

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import type { UserPublic, LoginCredentials, AuthResponse, PaginatedUsers, UserFilters, SessionInfo, UserStatus } from './types';

// API 함수
const api = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  async getCurrentUser(): Promise<UserPublic> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('사용자 정보를 가져올 수 없습니다.');
    return res.json();
  },

  async updateProfile(data: Partial<UserPublic>): Promise<UserPublic> {
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('프로필 업데이트에 실패했습니다.');
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch('/api/users/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '비밀번호 변경에 실패했습니다.');
    }
  },

  async getUsers(filters: UserFilters): Promise<PaginatedUsers> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const res = await fetch(`/api/users?${params.toString()}`);
    if (!res.ok) throw new Error('사용자 목록을 가져올 수 없습니다.');
    return res.json();
  },

  async getUserById(id: string): Promise<UserPublic> {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error('사용자 정보를 가져올 수 없습니다.');
    return res.json();
  },

  async createUser(data: { email: string; password: string; displayName: string; roleId: string }): Promise<UserPublic> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '사용자 생성에 실패했습니다.');
    }
    return res.json();
  },

  async updateUser(id: string, data: Partial<UserPublic>): Promise<UserPublic> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '사용자 업데이트에 실패했습니다.');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '사용자 삭제에 실패했습니다.');
    }
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<UserPublic> {
    const res = await fetch(`/api/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '상태 업데이트에 실패했습니다.');
    }
    return res.json();
  },

  async getSessions(): Promise<SessionInfo[]> {
    const res = await fetch('/api/users/sessions');
    if (!res.ok) throw new Error('세션 목록을 가져올 수 없습니다.');
    return res.json();
  },

  async revokeSession(id: string): Promise<void> {
    const res = await fetch(`/api/users/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('세션 해지에 실패했습니다.');
  },

  async revokeAllSessions(): Promise<void> {
    const res = await fetch('/api/users/sessions', { method: 'DELETE' });
    if (!res.ok) throw new Error('모든 세션 해지에 실패했습니다.');
  },
};

// ============================================
// Auth Context
// ============================================

interface AuthContextType {
  user: UserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserPublic>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserPublic>) => {
    const updatedUser = await api.updateProfile(data);
    setUser(updatedUser);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await api.changePassword(currentPassword, newPassword);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서만 사용할 수 있습니다.');
  }
  return context;
}

// ============================================
// Users Hook (회원 관리)
// ============================================

interface UseUsersReturn {
  users: UserPublic[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  refresh: () => Promise<void>;
  createUser: (data: { email: string; password: string; displayName: string; roleId: string }) => Promise<UserPublic>;
  updateUser: (id: string, data: Partial<UserPublic>) => Promise<UserPublic>;
  deleteUser: (id: string) => Promise<void>;
  updateStatus: (id: string, status: UserStatus) => Promise<UserPublic>;
}

export function useUsers(initialFilters?: UserFilters): UseUsersReturn {
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<UserFilters>(initialFilters || {});

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getUsers(filters);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setFilters = useCallback((newFilters: UserFilters) => {
    setFiltersState(newFilters);
  }, []);

  const createUser = useCallback(async (data: { email: string; password: string; displayName: string; roleId: string }) => {
    const user = await api.createUser(data);
    await fetchUsers();
    return user;
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, data: Partial<UserPublic>) => {
    const user = await api.updateUser(id, data);
    await fetchUsers();
    return user;
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    await api.deleteUser(id);
    await fetchUsers();
  }, [fetchUsers]);

  const updateStatus = useCallback(async (id: string, status: UserStatus) => {
    const user = await api.updateUserStatus(id, status);
    await fetchUsers();
    return user;
  }, [fetchUsers]);

  return {
    users,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateStatus,
  };
}

// ============================================
// Sessions Hook (세션 관리)
// ============================================

interface UseSessionsReturn {
  sessions: SessionInfo[];
  isLoading: boolean;
  error: string | null;
  revokeSession: (id: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSessionFn = useCallback(async (id: string) => {
    await api.revokeSession(id);
    await fetchSessions();
  }, [fetchSessions]);

  const revokeAllSessionsFn = useCallback(async () => {
    await api.revokeAllSessions();
    setSessions([]);
  }, []);

  return {
    sessions,
    isLoading,
    error,
    revokeSession: revokeSessionFn,
    revokeAllSessions: revokeAllSessionsFn,
  };
}
