// ============================================
// Core: 이메일 발송 - React Hooks
// ============================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { 
  EmailTemplatePublic, 
  EmailLogPublic, 
  EmailStats,
  EmailDashboard,
  EmailQueueItem,
  SendEmailInput,
  SendTemplateEmailInput,
  SendBulkEmailInput,
  EmailLogsFilter
} from './types';

// API 함수
const api = {
  // Templates
  async getTemplates(): Promise<EmailTemplatePublic[]> {
    const res = await fetch('/api/mail/templates');
    if (!res.ok) throw new Error('이메일 템플릿을 가져올 수 없습니다.');
    return res.json();
  },

  async getTemplate(id: string): Promise<EmailTemplatePublic> {
    const res = await fetch(`/api/mail/templates/${id}`);
    if (!res.ok) throw new Error('이메일 템플릿을 가져올 수 없습니다.');
    return res.json();
  },

  async createTemplate(data: Omit<EmailTemplatePublic, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplatePublic> {
    const res = await fetch('/api/mail/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '템플릿 생성에 실패했습니다.');
    }
    return res.json();
  },

  async updateTemplate(id: string, data: Partial<EmailTemplatePublic>): Promise<EmailTemplatePublic> {
    const res = await fetch(`/api/mail/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '템플릿 업데이트에 실패했습니다.');
    }
    return res.json();
  },

  async deleteTemplate(id: string): Promise<void> {
    const res = await fetch(`/api/mail/templates/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '템플릿 삭제에 실패했습니다.');
    }
  },

  // Logs
  async getLogs(filters: EmailLogsFilter): Promise<{ logs: EmailLogPublic[]; total: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });
    const res = await fetch(`/api/mail/logs?${params.toString()}`);
    if (!res.ok) throw new Error('이메일 로그를 가져올 수 없습니다.');
    return res.json();
  },

  async getLog(id: string): Promise<EmailLogPublic> {
    const res = await fetch(`/api/mail/logs/${id}`);
    if (!res.ok) throw new Error('이메일 로그를 가져올 수 없습니다.');
    return res.json();
  },

  async resendEmail(logId: string): Promise<void> {
    const res = await fetch(`/api/mail/logs/${logId}/resend`, { method: 'POST' });
    if (!res.ok) throw new Error('이메일 재발송에 실패했습니다.');
  },

  // Stats
  async getStats(): Promise<EmailStats> {
    const res = await fetch('/api/mail/stats');
    if (!res.ok) throw new Error('이메일 통계를 가져올 수 없습니다.');
    return res.json();
  },

  async getDashboard(): Promise<EmailDashboard> {
    const res = await fetch('/api/mail/dashboard');
    if (!res.ok) throw new Error('이메일 대시보드 데이터를 가져올 수 없습니다.');
    return res.json();
  },

  // Queue
  async getQueue(): Promise<EmailQueueItem[]> {
    const res = await fetch('/api/mail/queue');
    if (!res.ok) throw new Error('이메일 큐를 가져올 수 없습니다.');
    return res.json();
  },

  async cancelQueue(id: string): Promise<void> {
    const res = await fetch(`/api/mail/queue/${id}/cancel`, { method: 'POST' });
    if (!res.ok) throw new Error('이메일 큐 취소에 실패했습니다.');
  },

  // Sending
  async sendEmail(data: SendEmailInput): Promise<EmailLogPublic> {
    const res = await fetch('/api/mail/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '이메일 발송에 실패했습니다.');
    }
    return res.json();
  },

  async sendTemplateEmail(data: SendTemplateEmailInput): Promise<EmailLogPublic> {
    const res = await fetch('/api/mail/send/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '템플릿 이메일 발송에 실패했습니다.');
    }
    return res.json();
  },

  async sendBulkEmail(data: SendBulkEmailInput): Promise<EmailQueueItem> {
    const res = await fetch('/api/mail/send/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '대량 이메일 발송에 실패했습니다.');
    }
    return res.json();
  },

  // Test
  async sendTestEmail(templateId: string, testEmail: string): Promise<void> {
    const res = await fetch('/api/mail/send/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, testEmail }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '테스트 이메일 발송에 실패했습니다.');
    }
  },
};

// ============================================
// Email Templates Hook
// ============================================

interface UseEmailTemplatesReturn {
  templates: EmailTemplatePublic[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTemplate: (data: Omit<EmailTemplatePublic, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EmailTemplatePublic>;
  updateTemplate: (id: string, data: Partial<EmailTemplatePublic>) => Promise<EmailTemplatePublic>;
  deleteTemplate: (id: string) => Promise<void>;
}

export function useEmailTemplates(): UseEmailTemplatesReturn {
  const [templates, setTemplates] = useState<EmailTemplatePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplateFn = useCallback(async (data: Omit<EmailTemplatePublic, 'id' | 'createdAt' | 'updatedAt'>) => {
    const template = await api.createTemplate(data);
    await fetchTemplates();
    return template;
  }, [fetchTemplates]);

  const updateTemplateFn = useCallback(async (id: string, data: Partial<EmailTemplatePublic>) => {
    const template = await api.updateTemplate(id, data);
    await fetchTemplates();
    return template;
  }, [fetchTemplates]);

  const deleteTemplateFn = useCallback(async (id: string) => {
    await api.deleteTemplate(id);
    await fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    refresh: fetchTemplates,
    createTemplate: createTemplateFn,
    updateTemplate: updateTemplateFn,
    deleteTemplate: deleteTemplateFn,
  };
}

// ============================================
// Email Logs Hook
// ============================================

interface UseEmailLogsReturn {
  logs: EmailLogPublic[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: EmailLogsFilter;
  setFilters: (filters: EmailLogsFilter) => void;
  refresh: () => Promise<void>;
  resendEmail: (logId: string) => Promise<void>;
}

export function useEmailLogs(initialFilters?: EmailLogsFilter): UseEmailLogsReturn {
  const [logs, setLogs] = useState<EmailLogPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<EmailLogsFilter>(initialFilters || { page: 1, pageSize: 20 });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getLogs(filters);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const setFilters = useCallback((newFilters: EmailLogsFilter) => {
    setFiltersState(newFilters);
  }, []);

  const resendEmailFn = useCallback(async (logId: string) => {
    await api.resendEmail(logId);
    await fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchLogs,
    resendEmail: resendEmailFn,
  };
}

// ============================================
// Email Stats Hook
// ============================================

export function useEmailStats() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getStats();
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

// ============================================
// Email Dashboard Hook
// ============================================

export function useEmailDashboard() {
  const [dashboard, setDashboard] = useState<EmailDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, isLoading, error, refresh: fetchDashboard };
}

// ============================================
// Email Queue Hook
// ============================================

interface UseEmailQueueReturn {
  queue: EmailQueueItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  cancelQueue: (id: string) => Promise<void>;
}

export function useEmailQueue(): UseEmailQueueReturn {
  const [queue, setQueue] = useState<EmailQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getQueue();
      setQueue(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    // 60초마다 갱신
    const interval = setInterval(fetchQueue, 60000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const cancelQueueFn = useCallback(async (id: string) => {
    await api.cancelQueue(id);
    await fetchQueue();
  }, [fetchQueue]);

  return {
    queue,
    isLoading,
    error,
    refresh: fetchQueue,
    cancelQueue: cancelQueueFn,
  };
}

// ============================================
// Email Sending Hook
// ============================================

export function useEmailSender() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = useCallback(async (data: SendEmailInput) => {
    setIsSending(true);
    setError(null);
    try {
      await api.sendEmail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '이메일 발송에 실패했습니다.');
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendTemplateEmail = useCallback(async (data: SendTemplateEmailInput) => {
    setIsSending(true);
    setError(null);
    try {
      await api.sendTemplateEmail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '이메일 발송에 실패했습니다.');
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendBulkEmail = useCallback(async (data: SendBulkEmailInput) => {
    setIsSending(true);
    setError(null);
    try {
      await api.sendBulkEmail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대량 이메일 발송에 실패했습니다.');
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendTestEmail = useCallback(async (templateId: string, testEmail: string) => {
    setIsSending(true);
    setError(null);
    try {
      await api.sendTestEmail(templateId, testEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : '테스트 이메일 발송에 실패했습니다.');
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    isSending,
    error,
    sendEmail,
    sendTemplateEmail,
    sendBulkEmail,
    sendTestEmail,
  };
}
