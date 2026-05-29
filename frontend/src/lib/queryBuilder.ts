import { TodoFilter } from "@/types"

export function buildQuery(filter: TodoFilter & { search?: string }): string {
  const p = new URLSearchParams()
  if (filter.category !== undefined) p.set("category", String(filter.category))
  if (filter.tag !== undefined) p.set("tag", String(filter.tag))
  if (filter.priority !== undefined) p.set("priority", filter.priority)
  if (filter.completed !== undefined) p.set("completed", String(filter.completed))
  if (filter.search) p.set("search", filter.search)
  const qs = p.toString()
  return qs ? `?${qs}` : ""
}
