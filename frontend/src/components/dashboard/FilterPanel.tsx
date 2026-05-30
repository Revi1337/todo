"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { Category, Priority, Tag, TodoFilter } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

interface FilterPanelProps {
  filter: TodoFilter
  search: string
  categories: Category[]
  tags: Tag[]
  onFilterChange: (filter: TodoFilter) => void
  onSearchChange: (search: string) => void
  onReset: () => void
  onCreateTodo: () => void
  asSheet?: boolean
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

export function FilterPanel({ filter, search, categories, tags, onFilterChange, onSearchChange, onReset, onCreateTodo, asSheet }: FilterPanelProps) {
  return (
    <div className={asSheet ? "flex flex-col gap-6" : "w-64 shrink-0 hidden xl:flex flex-col gap-6"}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">대시보드</h2>
          <button
            onClick={onReset}
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-2 py-1"
          >
            필터 초기화
          </button>
        </div>
        <Button onClick={onCreateTodo} className="w-full justify-start gap-2 rounded-full" size="lg">
          <Plus className="w-5 h-5" /> 새 작업 추가
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="작업 검색..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 rounded-lg"
          />
        </div>

        <FilterSection title="상태">
          {[
            { label: "모든 작업", value: undefined },
            { label: "진행 중", value: false },
            { label: "완료됨", value: true },
          ].map(opt => (
            <Button key={String(opt.value)} variant={filter.completed === opt.value ? "default" : "ghost"}
              size="sm" className="justify-start rounded-lg w-full"
              onClick={() => onFilterChange({ ...filter, completed: opt.value })}>
              {opt.label}
            </Button>
          ))}
        </FilterSection>

        <FilterSection title="우선순위">
          {([undefined, "HIGH", "MEDIUM", "LOW"] as (Priority | undefined)[]).map(p => (
            <Button key={String(p)} variant={filter.priority === p ? "default" : "ghost"}
              size="sm" className="justify-start rounded-lg w-full"
              onClick={() => onFilterChange({ ...filter, priority: p })}>
              {p === undefined ? "전체" : PRIORITY_META[p].label}
            </Button>
          ))}
        </FilterSection>

        {categories.length > 0 && (
          <FilterSection title="카테고리">
            <Button variant={!filter.category ? "default" : "ghost"} size="sm"
              className="justify-start rounded-lg w-full"
              onClick={() => onFilterChange({ ...filter, category: undefined })}>전체</Button>
            {categories.map(c => (
              <Button key={c.id} variant={filter.category === c.id ? "default" : "ghost"} size="sm"
                className="justify-start rounded-lg w-full gap-2"
                onClick={() => onFilterChange({ ...filter, category: c.id })}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </Button>
            ))}
          </FilterSection>
        )}

        {tags.length > 0 && (
          <FilterSection title="태그">
            {tags.map(t => (
              <Button key={t.id} variant={filter.tag === t.id ? "default" : "ghost"} size="sm"
                className="justify-start rounded-lg w-full"
                onClick={() => onFilterChange({ ...filter, tag: filter.tag === t.id ? undefined : t.id })}>
                {t.name}
              </Button>
            ))}
          </FilterSection>
        )}
      </div>
    </div>
  )
}
