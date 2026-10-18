export type Tool =
  | "select"
  | "arrow"
  | "rect"
  | "ellipse"
  | "pen"
  | "highlighter"
  | "text"

export type SizePreset = "s" | "m" | "l"
export type FontFamily = "sans" | "serif" | "mono"

export interface Point {
  x: number
  y: number
}

export interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

interface Common {
  id: string
  color: string
  opacity: number
}

export interface ArrowAnnotation extends Common {
  type: "arrow"
  x1: number
  y1: number
  x2: number
  y2: number
  size: SizePreset
}

export interface BoxAnnotation extends Common {
  type: "rect" | "ellipse"
  x: number
  y: number
  w: number
  h: number
  size: SizePreset
}

export interface StrokeAnnotation extends Common {
  type: "pen" | "highlighter"
  points: Point[]
  size: SizePreset
}

export interface TextAnnotation extends Common {
  type: "text"
  x: number
  y: number
  text: string
  fontSize: number
  fontFamily: FontFamily
  background: boolean
}

export type Annotation =
  | ArrowAnnotation
  | BoxAnnotation
  | StrokeAnnotation
  | TextAnnotation

export type AnnotationType = Annotation["type"]

export interface BaseImage {
  url: string
  width: number
  height: number
  downscaled: boolean
}

export interface StyleSettings {
  color: string
  highlighterColor: string
  size: SizePreset
  opacity: number
  fontFamily: FontFamily
  textBackground: boolean
}

export interface StyleValues {
  color: string
  size: SizePreset | null
  opacity: number
  fontFamily: FontFamily
  background: boolean
}

export type StylePatch = Partial<StyleValues>
