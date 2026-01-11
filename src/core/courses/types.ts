// ============================================
// Core: 강의 관리 기능 - 타입 정의
// ============================================

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'published' | 'draft' | 'pending' | 'archived';

export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  price: number;
  duration: number;
  students: number;
  rating: number;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
}

export interface CourseFilters {
  category?: string;
  status?: string;
  search?: string;
}

export interface PaginatedCourses {
  courses: Course[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}
