import { useEffect, useRef } from 'react'

// Hook that returns a ref to attach to the header element and keeps
// `--app-header-height` updated on the document root. Uses ResizeObserver
// when available and falls back to window resize.
export default function useHeaderHeight() {
  const ref = useRef(null)

  useEffect(() => {
    function update() {
      const h = ref.current?.offsetHeight ?? 0
      document.documentElement.style.setProperty('--app-header-height', `${h}px`)
    }

    update()

    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update)
      if (ref.current) ro.observe(ref.current)
    } else {
      window.addEventListener('resize', update)
    }

    return () => {
      if (ro && ref.current) ro.unobserve(ref.current)
      if (!ro) window.removeEventListener('resize', update)
    }
  }, [])

  return ref
}
