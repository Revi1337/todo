"use client"

import { useRef, useState } from "react"
import { Combobox } from "@base-ui/react/combobox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories, useTags, useTodoForm } from "@/hooks"
import { Todo, Tag, Priority, DialogMode } from "@/types"
import { PRIORITY_META } from "@/constants/priority"

const DIALOG_TITLES: Record<DialogMode, string> = {
  view: "작업 상세",
  edit: "작업 수정",
  create: "새 작업 추가",
}

function PrioritySelector({ priority, onChange, disabled }: {
  priority: Priority
  onChange: (v: Priority) => void
  disabled: boolean
}) {
  return (
    <div className="flex gap-2">
      {(Object.keys(PRIORITY_META) as Priority[]).map(value => (
        <button
          key={value}
          type="button"
          data-active={priority === value}
          onClick={(e) => { e.preventDefault(); onChange(value) }}
          disabled={disabled}
          className={`flex-1 py-1.5 rounded-full border text-xs font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${PRIORITY_META[value].buttonColor}`}
        >
          {PRIORITY_META[value].label}
        </button>
      ))}
    </div>
  )
}

function DynamicTagSelector({ tags, selectedNames, onToggle, disabled, onDropdownChange }: {
  tags: Tag[]
  selectedNames: string[]
  onToggle: (name: string) => void
  disabled: boolean
  onDropdownChange?: (open: boolean) => void
}) {
  const [inputValue, setInputValue] = useState("")
  const [highlightedValue, setHighlightedValue] = useState<string | undefined>(undefined)

  const maxReached = selectedNames.length >= 5
  const trimmed = inputValue.trim()
  const filtered = tags.filter(
    t => !selectedNames.includes(t.name) && t.name.toLowerCase().includes(inputValue.toLowerCase())
  )
  const handleValueChange = (newValue: string[] | null) => {
    const next = (newValue ?? []).slice(0, 5)
    const prev = selectedNames
    next.filter(n => !prev.includes(n)).forEach(n => onToggle(n))
    prev.filter(n => !next.includes(n)).forEach(n => onToggle(n))
  }

  const addTagFromInput = () => {
    if (!trimmed || maxReached || selectedNames.some(n => n.toLowerCase() === trimmed.toLowerCase())) return
    const existing = tags.find(t => t.name.toLowerCase() === trimmed.toLowerCase())
    onToggle(existing ? existing.name : trimmed)
    setInputValue("")
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold">태그</Label>

      <Combobox.Root
        multiple={true}
        value={selectedNames}
        onValueChange={handleValueChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        onOpenChange={onDropdownChange}
        onItemHighlighted={(val) => setHighlightedValue(val as string | undefined)}
      >
        <Combobox.InputGroup className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
          <Combobox.Chips className="contents">
            {selectedNames.map(name => (
              <Combobox.Chip
                key={name}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30"
              >
                #{name}
                {!disabled && (
                  <Combobox.ChipRemove
                    className="flex items-center justify-center opacity-50 hover:opacity-100 cursor-pointer"
                    aria-label={`${name} 제거`}
                  >
                    <X className="w-3 h-3" />
                  </Combobox.ChipRemove>
                )}
              </Combobox.Chip>
            ))}
          </Combobox.Chips>

          {!disabled && !maxReached && (
            <div className="flex items-center gap-0.5">
              <span className="text-sm text-muted-foreground select-none">#</span>
              <Combobox.Input
                placeholder="태그입력"
                className="bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/60 outline-none w-16 focus:w-32 transition-all"
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (!highlightedValue) addTagFromInput()
                  }
                }}
              />
            </div>
          )}
          {!disabled && maxReached && (
            <span className="text-xs text-muted-foreground/50">최대 5개</span>
          )}
        </Combobox.InputGroup>

        {!disabled && !maxReached && filtered.length > 0 && (
          <Combobox.Portal>
            <Combobox.Positioner side="bottom" align="start" sideOffset={4} className="z-50">
              <Combobox.Popup className="w-[var(--anchor-width)] rounded-lg border border-border bg-card shadow-lg max-h-44 overflow-y-auto">
                <Combobox.List>
                  {filtered.map(tag => (
                    <Combobox.Item
                      key={tag.id}
                      value={tag.name}
                      className="flex items-center w-full px-3 py-2 text-sm cursor-pointer data-[highlighted]:bg-accent outline-none"
                    >
                      {tag.name}
                    </Combobox.Item>
                  ))}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        )}
      </Combobox.Root>
    </div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  todo?: Todo | null
  defaultDueDate?: string
  onSaved?: () => void
  onDelete?: (id: number) => void
}

export function TodoFormDialog({ open, onClose, todo, defaultDueDate, onSaved, onDelete }: Props) {
  const { categories } = useCategories()
  const { tags } = useTags()

  const {
    mode, setMode,
    title, setTitle,
    description, setDescription,
    priority, setPriority,
    dueDate, setDueDate,
    categoryId,
    selectedTagNames,
    loading, error,
    handleSubmit,
    toggleTag,
    handleCategoryChange,
  } = useTodoForm(open, todo, defaultDueDate, onClose, onSaved)

  const tagDropdownOpenRef = useRef(false)

  const isReadOnly = mode === "view"

  const getCategoryDisplay = () => {
    if (!categoryId) return "선택 없음"
    const category = categories.find(c => String(c.id) === categoryId)
    return category ? category.name : "선택 없음"
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && tagDropdownOpenRef.current) return; if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/60 rounded-2xl shadow-2xl" initialFocus={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {DIALOG_TITLES[mode]}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
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

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold">우선순위</Label>
            <PrioritySelector priority={priority} onChange={setPriority} disabled={isReadOnly} />
          </div>

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

          <DynamicTagSelector
            tags={tags}
            selectedNames={selectedTagNames}
            onToggle={toggleTag}
            disabled={isReadOnly}
            onDropdownChange={(isOpen) => { tagDropdownOpenRef.current = isOpen }}
          />

          <div className="flex justify-end gap-2 pt-1">
            {mode === "view" ? (
              <>
                {todo && onDelete && (
                  <Button type="button" variant="ghost" onClick={(e) => { e.preventDefault(); onDelete(todo.id); onClose() }} className="rounded-full px-5 text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto">
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                )}
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
