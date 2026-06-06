"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Category, Priority, Tag, TodoFilter } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

const TAG_ROWS = 6
const TAG_COLS = 5
const TAG_PAGE_SIZE = TAG_ROWS * TAG_COLS

const CAT_ROWS = 6
const CAT_COLS = 4
const CAT_PAGE_SIZE = CAT_ROWS * CAT_COLS

interface FilterPanelProps {
  filter: TodoFilter
  search: string
  categories: Category[]
  tags: Tag[]
  categoriesLoading?: boolean
  tagsLoading?: boolean
  onFilterChange: (filter: TodoFilter) => void
  onSearchChange: (search: string) => void
  onReset: () => void
  asSheet?: boolean
}

function FilterSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="p-0.5 rounded hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>
      <span className="text-xs text-muted-foreground tabular-nums">{page + 1}/{total}</span>
      <button
        onClick={() => onChange(Math.min(total - 1, page + 1))}
        disabled={page === total - 1}
        className="p-0.5 rounded hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}

function PaginatedGrid({ rows, cols, isLoading, children }: {
  rows: number
  cols: number
  isLoading?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="grid gap-0.5 [grid-auto-flow:column]"
      style={{
        gridTemplateRows: `repeat(${rows}, auto)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
    >
      {isLoading
        ? [...Array(rows * cols)].map((_, i) => (
            <div key={i} className="h-7 rounded-lg bg-border/60 animate-pulse" />
          ))
        : children}
    </div>
  )
}

export function FilterPanel({ filter, search, categories, tags, categoriesLoading, tagsLoading, onFilterChange, onSearchChange, onReset, asSheet }: FilterPanelProps) {
  const [tagPage, setTagPage] = useState(0)
  const [catPage, setCatPage] = useState(0)

  const totalTagPages = Math.ceil(tags.length / TAG_PAGE_SIZE)
  const pagedTags = tags.slice(tagPage * TAG_PAGE_SIZE, (tagPage + 1) * TAG_PAGE_SIZE)

  const allCategories = [{ id: undefined as number | undefined, name: "전체", color: "foreground" }, ...categories]
  const totalCatPages = Math.ceil(allCategories.length / CAT_PAGE_SIZE)
  const pagedCategories = allCategories.slice(catPage * CAT_PAGE_SIZE, (catPage + 1) * CAT_PAGE_SIZE)

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

        <FilterSection
          title="카테고리"
          action={<Pagination page={catPage} total={totalCatPages} onChange={setCatPage} />}
        >
          <PaginatedGrid rows={CAT_ROWS} cols={CAT_COLS} isLoading={categoriesLoading}>
            {pagedCategories.map(c => (
              <Button key={String(c.id)} variant={filter.category === c.id ? "default" : "ghost"} size="sm"
                className="relative justify-start rounded-lg w-full px-1.5 text-xs overflow-hidden gap-1"
                onClick={() => onFilterChange({ ...filter, category: c.id })}>
                <span title={c.name} className="absolute inset-0" />
                {c.color === "foreground"
                  ? <span className="w-2 h-2 rounded-full shrink-0 bg-foreground" />
                  : c.color && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                }
                <span className="truncate min-w-0">{c.name}</span>
              </Button>
            ))}
          </PaginatedGrid>
        </FilterSection>

        <FilterSection
          title="태그"
          action={<Pagination page={tagPage} total={totalTagPages} onChange={setTagPage} />}
        >
          <PaginatedGrid rows={TAG_ROWS} cols={TAG_COLS} isLoading={tagsLoading}>
            {pagedTags.map(t => (
              <Button key={t.id} variant={filter.tag === t.id ? "default" : "ghost"} size="sm"
                className="relative justify-start rounded-lg w-full px-2 text-xs overflow-hidden"
                onClick={() => onFilterChange({ ...filter, tag: filter.tag === t.id ? undefined : t.id })}>
                <span title={t.name} className="absolute inset-0" />
                <span className="truncate min-w-0">{t.name}</span>
              </Button>
            ))}
          </PaginatedGrid>
        </FilterSection>
      </div>
    </div>
  )
}
