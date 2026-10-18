import {
  FONT_STACKS,
  FONT_WEIGHT,
  HIGHLIGHT_SIZES,
  STROKE_SIZES,
} from "./constants"
import type {
  Annotation,
  ArrowAnnotation,
  Bounds,
  Point,
  TextAnnotation,
} from "./types"

let measureCtx: CanvasRenderingContext2D | null = null

function measure(text: string, font: string) {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d")
  if (!measureCtx) return text.length * 10
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

export function strokeWidthOf(a: Annotation, unit: number) {
  if (a.type === "text") return 0
  const table = a.type === "highlighter" ? HIGHLIGHT_SIZES : STROKE_SIZES
  return table[a.size] * unit
}

export function textFont(a: Pick<TextAnnotation, "fontSize" | "fontFamily">) {
  return `${FONT_WEIGHT} ${a.fontSize}px ${FONT_STACKS[a.fontFamily]}`
}

export function textLayout(a: TextAnnotation) {
  const lines = (a.text || " ").split("\n")
  const font = textFont(a)
  const lineHeight = a.fontSize * 1.25
  const pad = a.fontSize * 0.35
  const contentWidth = Math.max(
    a.fontSize * 0.5,
    ...lines.map((line) => measure(line, font)),
  )
  return {
    lines,
    font,
    lineHeight,
    pad,
    width: contentWidth + pad * 2,
    height: lines.length * lineHeight + pad * 2,
    baseline: (i: number) => a.y + pad + i * lineHeight + a.fontSize * 0.95,
  }
}

export function textBackgroundFor(color: string) {
  const hex = color.replace("#", "")
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? "rgba(17, 24, 39, 0.82)" : "rgba(255, 255, 255, 0.88)"
}

export function arrowGeometry(a: ArrowAnnotation, strokeWidth: number) {
  const dx = a.x2 - a.x1
  const dy = a.y2 - a.y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const head = Math.min(strokeWidth * 4.2, len * 0.6)
  const halfWidth = head * 0.62
  const baseX = a.x2 - ux * head
  const baseY = a.y2 - uy * head
  const shaftEnd = { x: a.x2 - ux * head * 0.8, y: a.y2 - uy * head * 0.8 }
  const headPoints: Point[] = [
    { x: a.x2, y: a.y2 },
    { x: baseX - uy * halfWidth, y: baseY + ux * halfWidth },
    { x: baseX + uy * halfWidth, y: baseY - ux * halfWidth },
  ]
  return { shaftEnd, headPoints }
}

export function strokePath(points: Point[]) {
  if (points.length === 0) return ""
  const [first] = points
  if (points.length === 1) {
    return `M ${first.x} ${first.y} L ${first.x + 0.01} ${first.y}`
  }
  let d = `M ${first.x} ${first.y}`
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]
    const next = points[i + 1]
    d += ` Q ${p.x} ${p.y} ${(p.x + next.x) / 2} ${(p.y + next.y) / 2}`
  }
  const last = points[points.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

export function normalizeBox(a: Point, b: Point): Bounds {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  }
}

function boundsOfPoints(points: Point[]): Bounds {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

export function boundsOf(a: Annotation): Bounds {
  switch (a.type) {
    case "arrow":
      return normalizeBox({ x: a.x1, y: a.y1 }, { x: a.x2, y: a.y2 })
    case "rect":
    case "ellipse":
      return { x: a.x, y: a.y, w: a.w, h: a.h }
    case "pen":
    case "highlighter":
      return boundsOfPoints(a.points)
    case "text": {
      const layout = textLayout(a)
      return { x: a.x, y: a.y, w: layout.width, h: layout.height }
    }
  }
}

export function translate(a: Annotation, dx: number, dy: number): Annotation {
  switch (a.type) {
    case "arrow":
      return { ...a, x1: a.x1 + dx, y1: a.y1 + dy, x2: a.x2 + dx, y2: a.y2 + dy }
    case "rect":
    case "ellipse":
    case "text":
      return { ...a, x: a.x + dx, y: a.y + dy }
    case "pen":
    case "highlighter":
      return { ...a, points: a.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
  }
}

export function resizeTo(a: Annotation, from: Bounds, to: Bounds): Annotation {
  const mapX = (x: number) => (from.w === 0 ? to.x : to.x + ((x - from.x) / from.w) * to.w)
  const mapY = (y: number) => (from.h === 0 ? to.y : to.y + ((y - from.y) / from.h) * to.h)
  switch (a.type) {
    case "arrow":
      return { ...a, x1: mapX(a.x1), y1: mapY(a.y1), x2: mapX(a.x2), y2: mapY(a.y2) }
    case "rect":
    case "ellipse":
      return { ...a, ...to }
    case "pen":
    case "highlighter":
      return { ...a, points: a.points.map((p) => ({ x: mapX(p.x), y: mapY(p.y) })) }
    case "text": {
      const scale = from.h === 0 ? 1 : to.h / from.h
      return { ...a, x: to.x, y: to.y, fontSize: Math.max(6, a.fontSize * scale) }
    }
  }
}

export type Corner = "nw" | "ne" | "sw" | "se"

export function cornerPoint(b: Bounds, corner: Corner): Point {
  return {
    x: corner === "nw" || corner === "sw" ? b.x : b.x + b.w,
    y: corner === "nw" || corner === "ne" ? b.y : b.y + b.h,
  }
}

export const OPPOSITE: Record<Corner, Corner> = { nw: "se", ne: "sw", sw: "ne", se: "nw" }

export function resizeBounds(
  from: Bounds,
  corner: Corner,
  pointer: Point,
  keepAspect: boolean,
): Bounds {
  const fixed = cornerPoint(from, OPPOSITE[corner])
  if (!keepAspect || from.w === 0 || from.h === 0) return normalizeBox(fixed, pointer)
  const scale = Math.max(
    0.05,
    Math.max(Math.abs(pointer.x - fixed.x) / from.w, Math.abs(pointer.y - fixed.y) / from.h),
  )
  const w = from.w * scale
  const h = from.h * scale
  return {
    x: pointer.x < fixed.x ? fixed.x - w : fixed.x,
    y: pointer.y < fixed.y ? fixed.y - h : fixed.y,
    w,
    h,
  }
}
