"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories } from "@/hooks/useCategories"
import { useTags } from "@/hooks/useTags"
import { useTodoForm } from "@/hooks/useTodoForm"
import { Todo, Priority } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

type DialogMode = "view" | "edit" | "create"

const DIALOG_TITLES: Record<DialogMode, string> = {
  view: "작업 상세",
  edit: "작업 수정",
  create: "새 작업 추가",
}

interface Props {
  open: boolean
  onClose: () => void
  todo?: Todo | null
  defaultDueDate?: string
}

export function TodoFormDialog({ open, onClose, todo, defaultDueDate }: Props) {
  const { categories } = useCategories()
  const { tags } = useTags()

  const {
    mode, setMode,
    title, setTitle,
    description, setDescription,
    priority, setPriority,
    dueDate, setDueDate,
    categoryId,
    selectedTagIds,
    loading, error,
    handleSubmit,
    toggleTag,
    handleCategoryChange,
  } = useTodoForm(open, todo, defaultDueDate, onClose)

  const isReadOnly = mode === "view"

  const getCategoryDisplay = () => {
    if (!categoryId) return "선택 없음"
    const category = categories.find(c => String(c.id) === categoryId)
    return category ? category.name : "선택 없음"
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/60 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {DIALOG_TITLES[mode]}
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
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </div>

          {/* 우선순위 */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold">우선순위</Label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_META) as Priority[]).map(value => (
                <button
                  key={value}
                  type="button"
                  data-active={priority === value}
                  onClick={(e) => { e.preventDefault(); setPriority(value) }}
                  disabled={isReadOnly}
                  className={`flex-1 py-1.5 rounded-full border text-xs font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${PRIORITY_META[value].buttonColor}`}
                >
                  {PRIORITY_META[value].label}
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
                disabled={isReadOnly}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-semibold">카테고리</Label>
              <Select value={categoryId} onValueChange={handleCategoryChange} disabled={isReadOnly}>
                <SelectTrigger className="w-full !h-10 bg-background/50 rounded-lg border-input disabled:opacity-100">
                  <SelectValue placeholder="선택 없음">
                    {getCategoryDisplay()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">선택 없음</SelectItem>
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
                    onClick={(e) => { e.preventDefault(); toggleTag(tag.id) }}
                    disabled={isReadOnly}
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
            {mode === "view" ? (
              <>
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); onClose() }} className="rounded-full px-5">
                  닫기
                </Button>
                <Button type="button" onClick={(e) => { e.preventDefault(); setMode("edit") }} className="rounded-full px-5">
                  편집
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); mode === "edit" ? setMode("view") : onClose() }} className="rounded-full px-5" disabled={loading}>
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
