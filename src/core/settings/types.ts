// ============================================
// Core: 설정 관리 - 타입 정의
// ============================================

// Note: Prisma types removed - using Supabase instead

// 설정 타입
export type SettingType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'HTML' | 'IMAGE' | 'COLOR' | 'FONT';

// 프론트엔드 설정 타입
export interface SettingPublic {
  id: string;
  key: string;
  value: string;
  type: SettingType;
  group: string;
  description: string | null;
  isPublic: boolean;
}

export interface HomepageBlockPublic {
  id: string;
  area: string;
  name: string;
  content: string;
  config: string | null;
  isActive: boolean;
  sortOrder: number;
}

// 그룹별 설정
export interface SettingsGroup {
  group: string;
  groupLabel: string;
  description: string | null;
  settings: SettingPublic[];
}

// 설정 업데이트
export interface SettingUpdateInput {
  key: string;
  value: string;
}

export interface HomepageBlockInput {
  area: string;
  name: string;
  content: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
  sortOrder?: number;
}

// 홈페이지 설정 그룹
export type SettingGroupKey =
  | 'general'      // 일반 설정
  | 'seo'          // SEO 설정
  | 'social'       // 소셜 미디어
  | 'homepage'     // 홈페이지
  | 'header'       // 헤더
  | 'footer'       // 푸터
  | 'contact'      // 연락처
  | 'analytics'    // 분석
  | 'email'        // 이메일
  | 'security'     // 보안
  | 'advanced';    // 고급 설정

// 그룹 라벨
export const SETTING_GROUP_LABELS: Record<SettingGroupKey, string> = {
  general: '일반 설정',
  seo: 'SEO 설정',
  social: '소셜 미디어',
  homepage: '홈페이지',
  header: '헤더',
  footer: '푸터',
  contact: '연락처',
  analytics: '분석',
  email: '이메일',
  security: '보안',
  advanced: '고급 설정',
};

// 주요 설정 키
export interface SiteSettings {
  // 일반
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  locale: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogImage: string;

  // 소셜
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;

  // 홈페이지
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  featuredTitle: string;

  // 분석
  googleAnalyticsId: string;
  googleTagManagerId: string;

  // 이메일
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  fromEmail: string;
  fromName: string;
}
