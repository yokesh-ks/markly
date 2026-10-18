import type { PointerEvent } from "react"

import { HIGHLIGHTER_ALPHA } from "@/editor/constants"
import {
  arrowGeometry,
  strokePath,
  strokeWidthOf,
  textBackgroundFor,
  textLayout,
} from "@/editor/geometry"
import type { Annotation } from "@/editor/types"

interface AnnotationShapeProps {
  annotation: Annotation
  unit: number
  hitWidth: number
  hidden?: boolean
  onPointerDown: (e: PointerEvent<SVGGElement>, id: string) => void
  onDoubleClick: (id: string) => void
}

export function AnnotationShape({
  annotation: a,
  unit,
  hitWidth,
  hidden,
  onPointerDown,
  onDoubleClick,
}: AnnotationShapeProps) {
  const sw = strokeWidthOf(a, unit)
  const hit = Math.max(sw, hitWidth)
  const hitProps = {
    fill: "none",
    stroke: "transparent",
    strokeWidth: hit,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pointerEvents: "stroke" as const,
  }
  const visible = {
    stroke: a.color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
    pointerEvents: "none" as const,
  }

  let body: React.ReactNode
  switch (a.type) {
    case "arrow": {
      const { shaftEnd, headPoints } = arrowGeometry(a, sw)
      const points = headPoints.map((p) => `${p.x},${p.y}`).join(" ")
      body = (
        <>
          <line x1={a.x1} y1={a.y1} x2={shaftEnd.x} y2={shaftEnd.y} {...visible} />
          <polygon points={points} {...visible} fill={a.color} strokeWidth={sw * 0.5} />
          <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} {...hitProps} />
        </>
      )
      break
    }
    case "rect":
      body = (
        <>
          <rect x={a.x} y={a.y} width={a.w} height={a.h} {...visible} />
          <rect x={a.x} y={a.y} width={a.w} height={a.h} {...hitProps} />
        </>
      )
      break
    case "ellipse": {
      const props = { cx: a.x + a.w / 2, cy: a.y + a.h / 2, rx: a.w / 2, ry: a.h / 2 }
      body = (
        <>
          <ellipse {...props} {...visible} />
          <ellipse {...props} {...hitProps} />
        </>
      )
      break
    }
    case "pen":
    case "highlighter": {
      const d = strokePath(a.points)
      body = (
        <>
          <path
            d={d}
            {...visible}
            opacity={a.type === "highlighter" ? HIGHLIGHTER_ALPHA : undefined}
            style={a.type === "highlighter" ? { mixBlendMode: "multiply" } : undefined}
          />
          <path d={d} {...hitProps} />
        </>
      )
      break
    }
    case "text": {
      const layout = textLayout(a)
      body = (
        <>
          <rect
            x={a.x}
            y={a.y}
            width={layout.width}
            height={layout.height}
            rx={layout.pad * 0.6}
            fill={a.background ? textBackgroundFor(a.color) : "transparent"}
            pointerEvents="all"
          />
          <text
            fill={a.color}
            style={{ font: layout.font, whiteSpace: "pre" }}
            pointerEvents="none"
          >
            {layout.lines.map((line, i) => (
              <tspan key={i} x={a.x + layout.pad} y={layout.baseline(i)}>
                {line}
              </tspan>
            ))}
          </text>
        </>
      )
      break
    }
  }

  return (
    <g
      data-annotation-id={a.id}
      opacity={a.opacity}
      visibility={hidden ? "hidden" : undefined}
      className="cursor-move"
      onPointerDown={(e) => onPointerDown(e, a.id)}
      onDoubleClick={() => onDoubleClick(a.id)}
    >
      {body}
    </g>
  )
}
