import type { PointerEvent } from "react"

import { boundsOf, cornerPoint, type Corner } from "@/editor/geometry"
import type { Annotation } from "@/editor/types"

const CORNERS: Corner[] = ["nw", "ne", "sw", "se"]
const CURSORS: Record<Corner, string> = {
  nw: "cursor-nwse-resize",
  se: "cursor-nwse-resize",
  ne: "cursor-nesw-resize",
  sw: "cursor-nesw-resize",
}

interface SelectionOverlayProps {
  annotation: Annotation
  scale: number
  onCornerDown: (e: PointerEvent<SVGElement>, corner: Corner) => void
  onEndpointDown: (e: PointerEvent<SVGElement>, end: 1 | 2) => void
}

export function SelectionOverlay({
  annotation: a,
  scale,
  onCornerDown,
  onEndpointDown,
}: SelectionOverlayProps) {
  const handle = 10 / scale
  const handleClass = "fill-background stroke-selection"

  if (a.type === "arrow") {
    return (
      <g>
        {([1, 2] as const).map((end) => (
          <circle
            key={end}
            data-handle={`end-${end}`}
            cx={end === 1 ? a.x1 : a.x2}
            cy={end === 1 ? a.y1 : a.y2}
            r={handle * 0.6}
            className={`${handleClass} cursor-crosshair`}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            onPointerDown={(e) => onEndpointDown(e, end)}
          />
        ))}
      </g>
    )
  }

  const b = boundsOf(a)
  const pad = 4 / scale
  const box = { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 }

  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        fill="none"
        className="stroke-selection"
        strokeWidth={1.5}
        strokeDasharray="5 4"
        vectorEffect="non-scaling-stroke"
        pointerEvents="none"
      />
      {CORNERS.map((corner) => {
        const p = cornerPoint(box, corner)
        return (
          <rect
            key={corner}
            data-handle={corner}
            x={p.x - handle / 2}
            y={p.y - handle / 2}
            width={handle}
            height={handle}
            rx={handle * 0.2}
            className={`${handleClass} ${CURSORS[corner]}`}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            onPointerDown={(e) => onCornerDown(e, corner)}
          />
        )
      })}
    </g>
  )
}
