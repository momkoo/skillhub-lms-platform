// ============================================
// Core: 접속자 분석 - 타입 정의
// ============================================

// 방문자 로그
export interface VisitorLog {
  id: string;
  sessionId: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  userAgent: string | null;
  pageUrl: string;
  referer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  eventType: string | null;
  visitedAt: Date;
}

// 페이지 분석
export interface PageAnalytics {
  id: string;
  date: Date;
  pageUrl: string;
  pageTitle: string | null;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
}

// 기기 통계
export interface DeviceStats {
  id: string;
  date: Date;
  device: string;
  browser: string | null;
  os: string | null;
  pageViews: number;
  uniqueVisitors: number;
}

// 트래픽 소스
export interface TrafficSource {
  id: string;
  date: Date;
  source: string;
  medium: string;
  pageViews: number;
  uniqueVisitors: number;
  conversions: number;
}

// 대시보드 통계
export interface AnalyticsDashboard {
  // 개요
  totalVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  
  // 기간 비교
  visitorsChange: number;
  pageViewsChange: number;
  sessionDurationChange: number;
  bounceRateChange: number;
  
  // 차트 데이터
  visitorsByDate: { date: string; visitors: number; pageViews: number }[];
  topPages: { pageUrl: string; pageViews: number; uniqueVisitors: number }[];
  topReferrers: { source: string; visitors: number; pageViews: number }[];
  deviceDistribution: { device: string; count: number; percentage: number }[];
  browserDistribution: { browser: string; count: number; percentage: number }[];
  
  // 실시간
  activeVisitors: number;
  recentPages: { pageUrl: string; visitors: number }[];
}

// 필터 타입
export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  pageUrl?: string;
  referer?: string;
  device?: string;
  country?: string;
}

// API 응답
export interface PaginatedLogs {
  logs: VisitorLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 실시간 방문자
export interface RealtimeVisitor {
  sessionId: string;
  pageUrl: string;
  referer: string | null;
  device: string | null;
  browser: string | null;
  country: string | null;
  city: string | null;
  startedAt: Date;
}
