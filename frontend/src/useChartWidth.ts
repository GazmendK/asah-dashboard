import { useEffect, useState } from 'react'

// Vega-Lite braucht eine feste Pixelbreite und passt sich nicht von selbst an.
export function useChartWidth() {
  const [width, setWidth] = useState(640)
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      // 56 Pixel Abzug fuer Achsenbeschriftung und Innenabstand der Karte,
      // 280 als Untergrenze, damit das Diagramm nicht unlesbar schmal wird.
      if (w) setWidth(Math.max(280, Math.floor(w) - 56))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  // ref ist bewusst die setState-Funktion, so loest das Einhaengen des
  // Elements ein erneutes Rendern aus und der Observer greift sofort.
  return { ref: setNode, width }
}
