import { useEffect, useState } from 'react'

export function useChartWidth() {
  const [width, setWidth] = useState(640)
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth(Math.max(280, Math.floor(w) - 56))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return { ref: setNode, width }
}
