import { useState, useEffect } from "react"
import dayjs from "dayjs"
import { Todo, Priority, DialogMode } from "@/types"
import { useTodoMutations } from "./useTodoMutations"

export function useTodoForm(
  open: boolean,
  todo: Todo | null | undefined,
  defaultDueDate: string | undefined,
  onClose: () => void,
  onSaved?: () => void,
) {
  const { createTodo, updateTodo } = useTodoMutations()

  const [mode, setMode] = useState<DialogMode>("create")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    if (todo) {
      setMode("view")
      setTitle(todo.title)
      setDescription(todo.description || "")
      setPriority(todo.priority)
      setDueDate(todo.dueDate ? dayjs(todo.dueDate).format("YYYY-MM-DD") : "")
      setCategoryId(todo.category ? String(todo.category.id) : "")
      setSelectedTagIds(todo.tags.map(t => t.id))
    } else {
      setMode("create")
      setTitle("")
      setDescription("")
      setPriority("MEDIUM")
      setDueDate(defaultDueDate || "")
      setCategoryId("")
      setSelectedTagIds([])
    }
    setError("")
  }, [open, todo, defaultDueDate])

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError("제목을 입력하세요."); return }
    setLoading(true)
    setError("")
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || (mode === "create" ? dayjs().format("YYYY-MM-DD") : undefined),
        categoryId: categoryId ? Number(categoryId) : undefined,
        tagIds: selectedTagIds,
      }
      if (todo) {
        await updateTodo(todo.id, { ...payload, completed: todo.completed })
      } else {
        await createTodo(payload)
      }
      onSaved?.()
      onClose()
    } catch {
      setError("저장 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (id: number) =>
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const handleCategoryChange = (v: string | null) =>
    setCategoryId(v === "none" ? "" : (v || ""))

  return {
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
  }
}
