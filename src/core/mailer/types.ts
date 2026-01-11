// ============================================
// Core: 이메일 발송 - 타입 정의
// ============================================

// Note: Prisma types removed - using Supabase instead

// 이메일 템플릿
export interface EmailTemplatePublic {
  id: string;
  name: string;
  subject: string;
  content: string;
  htmlContent: string | null;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 이메일 로그
export interface EmailLogPublic {
  id: string;
  templateId: string | null;
  template: EmailTemplatePublic | null;
  recipient: string;
  recipientName: string | null;
  subject: string;
  content: string | null;
  status: EmailStatus;
  errorMessage: string | null;
  sentAt: Date | null;
  openedAt: Date | null;
  clickedAt: Date | null;
  createdAt: Date;
}

export type EmailStatus = 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED' | 'SPAM' | 'OPENED' | 'CLICKED';

// 이메일 발송 요청
export interface SendEmailInput {
  to: string;
  toName?: string;
  subject: string;
  content: string;
  htmlContent?: string;
  fromAddress?: string;
  replyTo?: string;
}

export interface SendTemplateEmailInput {
  templateId: string;
  to: string;
  toName?: string;
  variables: Record<string, string>;
}

export interface SendBulkEmailInput {
  templateId: string;
  recipients: { email: string; name?: string; variables?: Record<string, string> }[];
  scheduledAt?: Date;
}

// 이메일 큐
export interface EmailQueueItem {
  id: string;
  templateId: string;
  recipientCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  scheduledAt: Date | null;
  createdAt: Date;
}

// 이메일 통계
export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  recentLogs: EmailLogPublic[];
}

// 대시보드 통계
export interface EmailDashboard {
  todaySent: number;
  todayDelivered: number;
  todayFailed: number;
  weekData: { date: string; sent: number; opened: number; clicked: number }[];
  topTemplates: { name: string; sentCount: number }[];
  recentFailed: { recipient: string; error: string; createdAt: Date }[];
}

// 필터
export interface EmailLogsFilter {
  status?: EmailStatus;
  templateId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
}
