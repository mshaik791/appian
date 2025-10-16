import * as React from "react"

import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  setValue: (v: string) => void
  baseId: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string
}

export function Tabs({ defaultValue, className, children, ...props }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue)
  const baseId = React.useId()
  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      role="tablist"
      {...props}
    />
  )
}

export function TabsTrigger({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const selected = ctx?.value === value
  const id = `${ctx?.baseId}-tab-${value}`
  const panelId = `${ctx?.baseId}-panel-${value}`
  return (
    <button
      type="button"
      onClick={() => ctx?.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        selected ? "bg-background text-foreground shadow" : "text-muted-foreground",
        className
      )}
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={panelId}
      aria-pressed={selected}
      {...props}
    />
  )
}

export function TabsContent({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const id = `${ctx?.baseId}-panel-${value}`
  const tabId = `${ctx?.baseId}-tab-${value}`
  if (ctx?.value !== value) return null
  return <div className={cn("mt-4", className)} role="tabpanel" id={id} aria-labelledby={tabId} {...props} />
}


