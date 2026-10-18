import { FONT_SIZES } from "./constants"
import { translate } from "./geometry"
import type {
  Annotation,
  Point,
  SizePreset,
  StylePatch,
  StyleSettings,
  Tool,
} from "./types"

export function newId() {
  return crypto.randomUUID()
}

export function createAnnotation(
  tool: Exclude<Tool, "select">,
  at: Point,
  style: StyleSettings,
  unit: number,
): Annotation {
  const common = { id: newId(), color: style.color, opacity: style.opacity }
  switch (tool) {
    case "arrow":
      return { ...common, type: "arrow", x1: at.x, y1: at.y, x2: at.x, y2: at.y, size: style.size }
    case "rect":
    case "ellipse":
      return { ...common, type: tool, x: at.x, y: at.y, w: 0, h: 0, size: style.size }
    case "pen":
      return { ...common, type: "pen", points: [at], size: style.size }
    case "highlighter":
      return {
        ...common,
        color: style.highlighterColor,
        type: "highlighter",
        points: [at],
        size: style.size,
      }
    case "text":
      return {
        ...common,
        type: "text",
        x: at.x,
        y: at.y,
        text: "",
        fontSize: FONT_SIZES[style.size] * unit,
        fontFamily: style.fontFamily,
        background: style.textBackground,
      }
  }
}

export type LayerMove = "front" | "forward" | "backward" | "back"

export function moveLayer(list: Annotation[], id: string, move: LayerMove) {
  const index = list.findIndex((a) => a.id === id)
  if (index === -1) return list
  const target = {
    front: list.length - 1,
    forward: Math.min(list.length - 1, index + 1),
    backward: Math.max(0, index - 1),
    back: 0,
  }[move]
  if (target === index) return list
  const next = [...list]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function duplicateIn(list: Annotation[], id: string, offset: number) {
  const source = list.find((a) => a.id === id)
  if (!source) return null
  const copy = { ...translate(source, offset, offset), id: newId() }
  return { list: [...list, copy], id: copy.id }
}

export function applyStylePatch(a: Annotation, patch: StylePatch, unit: number): Annotation {
  const base = {
    ...a,
    color: patch.color ?? a.color,
    opacity: patch.opacity ?? a.opacity,
  }
  if (base.type !== "text") return patch.size ? { ...base, size: patch.size } : base
  return {
    ...base,
    fontSize: patch.size ? FONT_SIZES[patch.size] * unit : base.fontSize,
    fontFamily: patch.fontFamily ?? base.fontFamily,
    background: patch.background ?? base.background,
  }
}

export function fontPresetFor(fontSize: number, unit: number): SizePreset | null {
  const match = (Object.keys(FONT_SIZES) as SizePreset[]).find(
    (key) => Math.abs(FONT_SIZES[key] * unit - fontSize) < 0.5,
  )
  return match ?? null
}

export function updateIn(list: Annotation[], id: string, patch: (a: Annotation) => Annotation) {
  return list.map((a) => (a.id === id ? patch(a) : a))
}
