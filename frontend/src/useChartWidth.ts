import { useEffect, useRef, useState } from 'react'

export function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(Math.max(280, Math.floor(w) - 56))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, width }
}
