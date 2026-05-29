export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  completedAt: string | null;
  category: Category | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  position: number;
}

export interface TodoRequest {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  categoryId?: number;
  tagIds?: number[];
  completed?: boolean;
}

export interface TodoFilter {
  category?: number;
  tag?: number;
  priority?: Priority;
  completed?: boolean;
  search?: string;
  dueDate?: string;
}

export interface CategoryStat {
  categoryName: string;
  total: number;
  completed: number;
}

export interface DailyStat {
  date: string;
  day: string | null;
  count: number;
}

export interface StatsResponse {
  totalCount: number;
  completedCount: number;
  completionRate: number;
  byCategory: CategoryStat[];
  weeklyTrend: DailyStat[];
  monthlyTrend: DailyStat[];
}
