"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTodos } from "@/hooks/useTodos"
import { useCategories } from "@/hooks/useCategories"
import { useTags } from "@/hooks/useTags"
import { Todo, Priority } from "@/types"
import dayjs from "dayjs"

interface Props {
  open: boolean
  onClose: () => void
  todo?: Todo | null
  defaultDueDate?: string
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "HIGH",   label: "긴급", color: "text-red-500 bg-red-500/10 border-red-500/40 data-[active=true]:bg-red-500 data-[active=true]:text-white" },
  { value: "MEDIUM", label: "보통", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/40 data-[active=true]:bg-yellow-500 data-[active=true]:text-white" },
  { value: "LOW",    label: "낮음", color: "text-slate-500 bg-slate-500/10 border-slate-500/40 data-[active=true]:bg-slate-500 data-[active=true]:text-white" },
]

export function TodoFormDialog({ open, onClose, todo, defaultDueDate }: Props) {
  const { createTodo, updateTodo } = useTodos()
  const { categories } = useCategories()
  const { tags } = useTags()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (!open) return
    if (todo) {
      setIsEditMode(false)
      setTitle(todo.title)
      setDescription(todo.description || "")
      setPriority(todo.priority)
      setDueDate(todo.dueDate ? dayjs(todo.dueDate).format("YYYY-MM-DD") : "")
      setCategoryId(todo.category ? String(todo.category.id) : "")
      setSelectedTagIds(todo.tags.map(t => t.id))
    } else {
      setIsEditMode(true)
      setTitle("")
      setDescription("")
      setPriority("MEDIUM")
      setDueDate(defaultDueDate || "")
      setCategoryId("")
      setSelectedTagIds([])
    }
    setError("")
  }, [open, todo, defaultDueDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError("제목을 입력하세요."); return }
    setLoading(true)
    setError("")
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || (!todo ? dayjs().format("YYYY-MM-DD") : undefined),
        categoryId: categoryId ? Number(categoryId) : undefined,
        tagIds: selectedTagIds,
      }
      if (todo) {
        await updateTodo(todo.id, { ...payload, completed: todo.completed })
      } else {
        await createTodo(payload)
      }
      onClose()
    } catch {
      setError("저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (id: number) =>
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/60 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {!isEditMode && todo ? "작업 상세" : (todo ? "작업 수정" : "새 작업 추가")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          {/* 제목 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="text-sm font-semibold">제목 <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="bg-background/50 h-10 disabled:opacity-100"
              disabled={!isEditMode}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* 설명 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-sm font-semibold">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="설명을 입력하세요 (선택)"
              className="bg-background/50 disabled:opacity-100 min-h-[80px]"
              rows={3}
              disabled={!isEditMode}
            />
          </div>

          {/* 우선순위 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold">우선순위</Label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  data-active={priority === opt.value}
                  onClick={(e) => { e.preventDefault(); setPriority(opt.value); }}
                  disabled={!isEditMode}
                  className={`flex-1 py-1.5 rounded-full border text-xs font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${opt.color}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 마감일 + 카테고리 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate" className="text-sm font-semibold">마감일</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-background/50 h-10 disabled:opacity-100"
                disabled={!isEditMode}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-semibold">카테고리</Label>
              <Select value={categoryId} onValueChange={v => setCategoryId(v ?? "")} disabled={!isEditMode}>
                <SelectTrigger className="bg-background/50 h-10 rounded-lg border-input disabled:opacity-100">
                  <SelectValue placeholder="선택 없음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">선택 없음</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-semibold">태그</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={(e) => { e.preventDefault(); toggleTag(tag.id); }}
                    disabled={!isEditMode}
                    className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all disabled:opacity-80 disabled:cursor-not-allowed ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background/50 text-muted-foreground border-border/50 hover:border-primary/50"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 pt-1">
            {!isEditMode && todo ? (
              <>
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); onClose(); }} className="rounded-full px-5">
                  닫기
                </Button>
                <Button type="button" onClick={(e) => { e.preventDefault(); setIsEditMode(true); }} className="rounded-full px-5">
                  편집
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); todo ? setIsEditMode(false) : onClose(); }} className="rounded-full px-5" disabled={loading}>
                  취소
                </Button>
                <Button type="submit" className="rounded-full px-5" disabled={loading}>
                  {loading ? "저장 중..." : "저장하기"}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
