// ============================================
// Core: 강의 관리 기능 - 유틸리티 함수
// ============================================

import { Course, CourseLevel, CourseStatus } from './types';

export const formatPrice = (price: number): string => {
  if (price === 0) return '무료';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}시간 ${mins}분`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getLevelLabel = (level: CourseLevel): string => {
  const labels: Record<CourseLevel, string> = {
    beginner: '입문',
    intermediate: '중급',
    advanced: '고급',
  };
  return labels[level];
};

export const getStatusLabel = (status: CourseStatus): string => {
  const labels: Record<CourseStatus, string> = {
    published: '게시중',
    draft: '초안',
    pending: '심사중',
    archived: '보관됨',
  };
  return labels[status];
};

export const calculateCourseStats = (courses: Course[]): {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
} => {
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.status === 'published').length;
  const totalStudents = courses.reduce((acc, c) => acc + c.students, 0);
  const totalRevenue = courses
    .filter((c) => c.status === 'published')
    .reduce((acc, c) => acc + c.price * c.students, 0);

  return {
    totalCourses,
    publishedCourses,
    totalStudents,
    totalRevenue,
  };
};

export const filterCourses = (
  courses: Course[],
  filters: { category?: string; status?: string; search?: string }
): Course[] => {
  let filtered = [...courses];

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((c) => c.category === filters.category);
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((c) => c.status === filters.status);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(searchLower) ||
        c.instructor.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

export const paginateCourses = (
  courses: Course[],
  page: number,
  pageSize: number = 10
): { courses: Course[]; totalPages: number; totalCount: number; currentPage: number } => {
  const totalCount = courses.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedCourses = courses.slice(startIndex, startIndex + pageSize);

  return {
    courses: paginatedCourses,
    totalPages,
    totalCount,
    currentPage: page,
  };
};
