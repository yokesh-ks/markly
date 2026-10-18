import type { FontFamily, SizePreset, StyleSettings } from "./types"

export const MAX_EDGE = 4096
export const HISTORY_LIMIT = 100
export const HIGHLIGHTER_ALPHA = 0.4

export const COLORS = [
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#111827",
  "#ffffff",
]

export const HIGHLIGHTER_COLORS = [
  "#fde047",
  "#86efac",
  "#67e8f9",
  "#f9a8d4",
  "#fdba74",
]

export const STROKE_SIZES: Record<SizePreset, number> = { s: 3, m: 5, l: 9 }
export const HIGHLIGHT_SIZES: Record<SizePreset, number> = { s: 14, m: 24, l: 38 }
export const FONT_SIZES: Record<SizePreset, number> = { s: 20, m: 30, l: 46 }

export const FONT_STACKS: Record<FontFamily, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
}

export const FONT_LABELS: Record<FontFamily, string> = {
  sans: "Sans",
  serif: "Serif",
  mono: "Mono",
}

export const FONT_WEIGHT = 600

export const DEFAULT_STYLE: StyleSettings = {
  color: COLORS[0],
  highlighterColor: HIGHLIGHTER_COLORS[0],
  size: "m",
  opacity: 1,
  fontFamily: "sans",
  textBackground: true,
}

export function unitFor(width: number, height: number) {
  return Math.max(1, Math.max(width, height) / 1200)
}
