// ============================================
// Core: 강의 관리 기능 - 훅 (React Hooks)
// ============================================

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Course, CourseFilters, CourseStats, PaginatedCourses } from './types';
import { SAMPLE_COURSES } from './data';
import { filterCourses, paginateCourses, calculateCourseStats } from './utils';

interface UseCoursesOptions {
  initialPage?: number;
  pageSize?: number;
  initialFilters?: CourseFilters;
}

interface UseCoursesReturn {
  // 데이터
  courses: Course[];
  stats: CourseStats;
  paginatedData: PaginatedCourses;
  
  // 상태
  loading: boolean;
  error: string | null;
  
  // 필터 상태
  filters: CourseFilters;
  setFilters: (filters: CourseFilters) => void;
  updateFilter: (key: keyof CourseFilters, value: string) => void;
  clearFilters: () => void;
  
  // 페이지 상태
  currentPage: number;
  setCurrentPage: (page: number) => void;
  
  // 액션
  refresh: () => void;
  getCourseById: (id: string) => Course | undefined;
}

export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
  const { initialPage = 1, pageSize = 10, initialFilters = {} } = options;

  // 서버 데이터 상태 (실제 API 호출 시 사용)
  const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [filters, setFiltersState] = useState<CourseFilters>({
    category: 'all',
    status: 'all',
    search: '',
    ...initialFilters,
  });

  // 페이지 상태
  const [currentPage, setCurrentPageState] = useState(initialPage);

  // 필터링된 데이터
  const filteredCourses = useMemo(() => {
    return filterCourses(courses, filters);
  }, [courses, filters]);

  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    return paginateCourses(filteredCourses, currentPage, pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  // 통계 계산
  const stats = useMemo(() => {
    return calculateCourseStats(courses);
  }, [courses]);

  // 필터 업데이트
  const updateFilter = (key: keyof CourseFilters, value: string) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  // 필터 초기화
  const clearFilters = () => {
    setFiltersState({
      category: 'all',
      status: 'all',
      search: '',
    });
    setCurrentPage(1);
  };

  // 페이지 변경
  const setCurrentPage = (page: number) => {
    setCurrentPageState(page);
  };

  // 필터 setter (객체로 한 번에 설정)
  const setFilters = (newFilters: CourseFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // 데이터 새로고침
  const refresh = () => {
    setLoading(true);
    // 실제 API 호출 시 여기에 fetch 로직 추가
    setTimeout(() => {
      setCourses(SAMPLE_COURSES);
      setLoading(false);
    }, 500);
  };

  // ID로 강의 조회
  const getCourseById = (id: string): Course | undefined => {
    return courses.find((c) => c.id === id);
  };

  return {
    courses,
    stats,
    paginatedData,
    loading,
    error,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    refresh,
    getCourseById,
  };
}

// ============================================
// 훅: 강의 통계 (필터링된 데이터 기준)
// ============================================

export function useCourseStats(courses: Course[], includeUnpublished: boolean = false): CourseStats {
  return useMemo(() => {
    const filtered = includeUnpublished ? courses : courses.filter((c) => c.status === 'published');
    return calculateCourseStats(filtered);
  }, [courses, includeUnpublished]);
}

// ============================================
// 훅: 강의 검색
// ============================================

export function useCourseSearch(courses: Course[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
  };
}
