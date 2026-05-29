import { Category, Tag, Todo } from "@/types";
import dayjs from "dayjs";

export const mockCategories: Category[] = [
  { id: 1, name: "개인", color: "#6366f1", createdAt: new Date().toISOString() },
  { id: 2, name: "업무", color: "#f59e0b", createdAt: new Date().toISOString() },
  { id: 3, name: "공부", color: "#10b981", createdAt: new Date().toISOString() },
];

export const mockTags: Tag[] = [
  { id: 1, name: "긴급", color: "#ef4444" },
  { id: 2, name: "루틴", color: "#3b82f6" },
  { id: 3, name: "기획", color: "#8b5cf6" },
];

export const mockTodos: Todo[] = [
  {
    id: 1,
    title: "리액트 컴포넌트 설계",
    description: "메인 페이지 칸반 보드 구현하기",
    completed: false,
    completedAt: null,
    dueDate: dayjs().add(2, 'day').toISOString(),
    priority: "HIGH",
    category: mockCategories[1],
    tags: [mockTags[0], mockTags[2]],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "영양제 챙겨 먹기",
    description: "아침 식사 후 비타민 섭취",
    completed: true,
    completedAt: new Date().toISOString(),
    dueDate: dayjs().toISOString(),
    priority: "MEDIUM",
    category: mockCategories[0],
    tags: [mockTags[1]],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "디자인 시스템 에셋 아카이빙",
    description: "Stitch에서 생성된 디자인을 로컬로 저장",
    completed: false,
    completedAt: null,
    dueDate: dayjs().subtract(1, 'day').toISOString(),
    priority: "LOW",
    category: mockCategories[1],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
