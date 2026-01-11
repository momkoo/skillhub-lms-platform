// ============================================
// Core: 접속자 분석 - React Hooks
// ============================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { 
  VisitorLog, 
  PageAnalytics, 
  DeviceStats, 
  TrafficSource,
  AnalyticsDashboard,
  AnalyticsFilters,
  PaginatedLogs,
  RealtimeVisitor
} from './types';

// API 함수
const api = {
  async getDashboard(filters: AnalyticsFilters): Promise<AnalyticsDashboard> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    
    const res = await fetch(`/api/analytics/dashboard?${params.toString()}`);
    if (!res.ok) throw new Error('대시보드 데이터를 가져올 수 없습니다.');
    return res.json();
  },

  async getVisitorLogs(filters: AnalyticsFilters & { page?: number; pageSize?: number }): Promise<PaginatedLogs> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });
    
    const res = await fetch(`/api/analytics/logs?${params.toString()}`);
    if (!res.ok) throw new Error('방문자 로그를 가져올 수 없습니다.');
    return res.json();
  },

  async getPageAnalytics(filters: AnalyticsFilters): Promise<PageAnalytics[]> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters.pageUrl) params.append('pageUrl', filters.pageUrl);
    
    const res = await fetch(`/api/analytics/pages?${params.toString()}`);
    if (!res.ok) throw new Error('페이지 분석 데이터를 가져올 수 없습니다.');
    return res.json();
  },

  async getDeviceStats(filters: AnalyticsFilters): Promise<DeviceStats[]> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    
    const res = await fetch(`/api/analytics/devices?${params.toString()}`);
    if (!res.ok) throw new Error('기기 통계를 가져올 수 없습니다.');
    return res.json();
  },

  async getTrafficSources(filters: AnalyticsFilters): Promise<TrafficSource[]> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    
    const res = await fetch(`/api/analytics/sources?${params.toString()}`);
    if (!res.ok) throw new Error('트래픽 소스를 가져올 수 없습니다.');
    return res.json();
  },

  async getRealtimeVisitors(): Promise<RealtimeVisitor[]> {
    const res = await fetch('/api/analytics/realtime');
    if (!res.ok) throw new Error('실시간 방문자 정보를 가져올 수 없습니다.');
    return res.json();
  },

  async trackEvent(data: { eventType: string; eventData?: Record<string, unknown> }): Promise<void> {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async exportData(filters: AnalyticsFilters, format: 'csv' | 'json'): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    
    const res = await fetch(`/api/analytics/export?${params.toString()}`);
    if (!res.ok) throw new Error('데이터 내보내기에 실패했습니다.');
    return res.blob();
  },
};

// ============================================
// Analytics Dashboard Hook
// ============================================

interface UseAnalyticsDashboardReturn {
  data: AnalyticsDashboard | null;
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
  refresh: () => Promise<void>;
}

export function useAnalyticsDashboard(initialFilters?: AnalyticsFilters): UseAnalyticsDashboardReturn {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AnalyticsFilters>(initialFilters || {});

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dashboardData = await api.getDashboard(filters);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const setFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFiltersState(newFilters);
  }, []);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchDashboard,
  };
}

// ============================================
// Visitor Logs Hook
// ============================================

interface UseVisitorLogsReturn {
  logs: VisitorLog[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters & { page?: number; pageSize?: number };
  setFilters: (filters: AnalyticsFilters & { page?: number; pageSize?: number }) => void;
  refresh: () => Promise<void>;
  exportData: (format: 'csv' | 'json') => Promise<void>;
}

export function useVisitorLogs(initialFilters?: AnalyticsFilters): UseVisitorLogsReturn {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AnalyticsFilters & { page?: number; pageSize?: number }>({
    ...initialFilters,
    page: 1,
    pageSize: 50,
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getVisitorLogs(filters);
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

  const setFilters = useCallback((newFilters: AnalyticsFilters & { page?: number; pageSize?: number }) => {
    setFiltersState(newFilters);
  }, []);

  const exportDataFn = useCallback(async (format: 'csv' | 'json') => {
    const blob = await api.exportData(filters, format);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [filters]);

  return {
    logs,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchLogs,
    exportData: exportDataFn,
  };
}

// ============================================
// Page Analytics Hook
// ============================================

interface UsePageAnalyticsReturn {
  analytics: PageAnalytics[];
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
  refresh: () => Promise<void>;
}

export function usePageAnalytics(initialFilters?: AnalyticsFilters): UsePageAnalyticsReturn {
  const [analytics, setAnalytics] = useState<PageAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AnalyticsFilters>(initialFilters || {});

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPageAnalytics(filters);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const setFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFiltersState(newFilters);
  }, []);

  return {
    analytics,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchAnalytics,
  };
}

// ============================================
// Device Stats Hook
// ============================================

interface UseDeviceStatsReturn {
  stats: DeviceStats[];
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
  refresh: () => Promise<void>;
}

export function useDeviceStats(initialFilters?: AnalyticsFilters): UseDeviceStatsReturn {
  const [stats, setStats] = useState<DeviceStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AnalyticsFilters>(initialFilters || {});

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDeviceStats(filters);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const setFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFiltersState(newFilters);
  }, []);

  return {
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchStats,
  };
}

// ============================================
// Traffic Sources Hook
// ============================================

interface UseTrafficSourcesReturn {
  sources: TrafficSource[];
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
  refresh: () => Promise<void>;
}

export function useTrafficSources(initialFilters?: AnalyticsFilters): UseTrafficSourcesReturn {
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AnalyticsFilters>(initialFilters || {});

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTrafficSources(filters);
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const setFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFiltersState(newFilters);
  }, []);

  return {
    sources,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchSources,
  };
}

// ============================================
// Realtime Hook
// ============================================

export function useRealtimeVisitors() {
  const [visitors, setVisitors] = useState<RealtimeVisitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRealtimeVisitors();
      setVisitors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
    
    // 30초마다 갱신
    const interval = setInterval(fetchVisitors, 30000);
    return () => clearInterval(interval);
  }, [fetchVisitors]);

  const trackEvent = useCallback((eventType: string, eventData?: Record<string, unknown>) => {
    api.trackEvent({ eventType, eventData });
  }, []);

  return { visitors, isLoading, error, refresh: fetchVisitors, trackEvent };
}
