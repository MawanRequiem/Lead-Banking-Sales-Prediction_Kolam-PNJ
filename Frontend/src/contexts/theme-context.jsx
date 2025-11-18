import { useEffect, useState } from "react"
import { ThemeProviderContext } from "./theme-context-consts"

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    // Cek preferensi warna sistem operasi
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    // Tambahkan class tema yang dipilih
    root.classList.add(theme)
  }, [theme])

  // Nilai yang akan disediakan melalui Context
  const value = {
    theme,
    // Fungsi untuk mengubah tema dan menyimpannya ke Local Storage
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Note: `useTheme` has been moved to `src/hooks/useTheme.jsx` to keep this
// file exporting only the `ThemeProvider` component so React Fast Refresh
// can preserve state correctly.