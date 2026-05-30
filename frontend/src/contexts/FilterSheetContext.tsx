"use client"

import { createContext, useContext, useState } from "react"

const FilterSheetContext = createContext<{
  open: boolean
  setOpen: (v: boolean) => void
}>({ open: false, setOpen: () => {} })

export function FilterSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <FilterSheetContext.Provider value={{ open, setOpen }}>
      {children}
    </FilterSheetContext.Provider>
  )
}

export const useFilterSheet = () => useContext(FilterSheetContext)
