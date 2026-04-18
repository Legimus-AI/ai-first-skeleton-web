# providers/ — React Context Providers

App-wide context (theme, query client, auth).

## Rules

- ✅ `.tsx` files only
- ✅ Export Provider + colocated `useX()` hook in same file
- ❌ Domain providers (scope to `slices/<X>/` instead)
- ❌ Grab-bag: `utils.tsx`, `common.tsx`, `shared.tsx`

## Example

```tsx
import { createContext, useContext, useState } from 'react'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme((t) => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme outside ThemeProvider')
  return ctx
}
```

Full contract: repo-root `AGENTS.md`.
