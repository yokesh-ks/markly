import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react"

import { AnnotationShape } from "@/components/editor/annotation-shape"
import { SelectionOverlay } from "@/components/editor/selection-overlay"
import { TextEditor } from "@/components/editor/text-editor"
import { createAnnotation, updateIn } from "@/editor/annotations"
import {
  boundsOf,
  normalizeBox,
  resizeBounds,
  resizeTo,
  translate,
  type Corner,
} from "@/editor/geometry"
import type { Annotation, BaseImage, Bounds, Point, StyleSettings, Tool } from "@/editor/types"
import type { History } from "@/hooks/use-history"
import { cn } from "@/lib/utils"

type Interaction =
  | { kind: "draw"; start: Point; origin: Annotation[]; draft: Annotation }
  | {
      kind: "move"
      id: string
      start: Point
      origin: Annotation[]
      original: Annotation
      moved: boolean
      editOnClick: boolean
    }
  | {
      kind: "resize"
      id: string
      corner: Corner
      from: Bounds
      origin: Annotation[]
      original: Annotation
    }
  | { kind: "endpoint"; id: string; end: 1 | 2; origin: Annotation[] }

interface StageProps {
  image: BaseImage
  history: History<Annotation[]>
  tool: Tool
  style: StyleSettings
  unit: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  cancelSignal: number
}

const FIT_PADDING = 48

export function Stage({
  image,
  history,
  tool,
  style,
  unit,
  selectedId,
  onSelect,
  cancelSignal,
}: StageProps) {
  const annotations = history.present
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const interaction = useRef<Interaction | null>(null)
  const editingRef = useRef<{ id: string; isNew: boolean } | null>(null)
  const [editing, setEditing] = useState<{ id: string; isNew: boolean } | null>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth - FIT_PADDING * 2
      const h = el.clientHeight - FIT_PADDING * 2
      setScale(Math.max(0.05, Math.min(w / image.width, h / image.height, 1)))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [image.width, image.height])

  const { cancel } = history
  useEffect(() => {
    if (cancelSignal === 0 || !interaction.current) return
    interaction.current = null
    cancel()
  }, [cancelSignal, cancel])

  const toImage = (e: { clientX: number; clientY: number }): Point => {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * image.width,
      y: ((e.clientY - rect.top) / rect.height) * image.height,
    }
  }

  const capture = (e: PointerEvent<Element>) => {
    svgRef.current?.setPointerCapture(e.pointerId)
  }

  const setEditingState = (value: { id: string; isNew: boolean } | null) => {
    editingRef.current = value
    setEditing(value)
  }

  const startEditing = (id: string, isNew: boolean) => {
    if (!isNew) history.begin()
    onSelect(id)
    setEditingState({ id, isNew })
  }

  const finishEditing = () => {
    const current = editingRef.current
    if (!current) return
    setEditingState(null)
    const a = history.present.find((x) => x.id === current.id)
    if (a && a.type === "text" && a.text.trim()) {
      history.end()
      return
    }
    if (current.isNew) {
      history.cancel()
    } else {
      history.preview(history.present.filter((x) => x.id !== current.id))
      history.end()
    }
    onSelect(null)
  }

  const handleBackgroundDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    if (editingRef.current) {
      finishEditing()
      return
    }
    if (tool === "select") {
      onSelect(null)
      return
    }
    const start = toImage(e)
    const draft = createAnnotation(tool, start, style, unit)
    history.begin()
    history.preview([...annotations, draft])
    onSelect(draft.id)
    if (tool === "text") {
      setEditingState({ id: draft.id, isNew: true })
      e.preventDefault()
      return
    }
    capture(e)
    interaction.current = { kind: "draw", start, origin: annotations, draft }
  }

  const handleShapeDown = (e: PointerEvent<SVGGElement>, id: string) => {
    if (e.button !== 0) return
    e.stopPropagation()
    if (editingRef.current) {
      finishEditing()
      return
    }
    const original = annotations.find((a) => a.id === id)
    if (!original) return
    const editOnClick = tool === "text" && original.type === "text"
    if (editOnClick) e.preventDefault()
    onSelect(id)
    capture(e)
    history.begin()
    interaction.current = {
      kind: "move",
      id,
      start: toImage(e),
      origin: annotations,
      original,
      moved: false,
      editOnClick,
    }
  }

  const handleCornerDown = (e: PointerEvent<SVGElement>, corner: Corner) => {
    e.stopPropagation()
    const original = annotations.find((a) => a.id === selectedId)
    if (!original) return
    capture(e)
    history.begin()
    interaction.current = {
      kind: "resize",
      id: original.id,
      corner,
      from: boundsOf(original),
      origin: annotations,
      original,
    }
  }

  const handleEndpointDown = (e: PointerEvent<SVGElement>, end: 1 | 2) => {
    e.stopPropagation()
    if (!selectedId) return
    capture(e)
    history.begin()
    interaction.current = { kind: "endpoint", id: selectedId, end, origin: annotations }
  }

  const handleMove = (e: PointerEvent<SVGSVGElement>) => {
    const current = interaction.current
    if (!current) return
    const p = toImage(e)
    switch (current.kind) {
      case "draw": {
        const draft = updateDraft(current.draft, current.start, p, e.shiftKey, scale)
        current.draft = draft
        history.preview([...current.origin, draft])
        break
      }
      case "move": {
        if (!current.moved && Math.hypot(p.x - current.start.x, p.y - current.start.y) * scale < 3) {
          break
        }
        current.moved = true
        const moved = translate(current.original, p.x - current.start.x, p.y - current.start.y)
        history.preview(updateIn(current.origin, current.id, () => moved))
        break
      }
      case "resize": {
        const keepAspect = current.original.type === "text" || e.shiftKey
        const to = resizeBounds(current.from, current.corner, p, keepAspect)
        history.preview(
          updateIn(current.origin, current.id, () => resizeTo(current.original, current.from, to)),
        )
        break
      }
      case "endpoint": {
        const key = current.end === 1 ? { x1: p.x, y1: p.y } : { x2: p.x, y2: p.y }
        history.preview(
          updateIn(current.origin, current.id, (a) => (a.type === "arrow" ? { ...a, ...key } : a)),
        )
        break
      }
    }
  }

  const handleUp = () => {
    const current = interaction.current
    interaction.current = null
    if (!current) return
    if (current.kind === "draw" && isTooSmall(current.draft, scale)) {
      history.cancel()
      onSelect(null)
      return
    }
    history.end()
    if (current.kind === "move" && current.editOnClick && !current.moved) {
      startEditing(current.id, false)
    }
  }

  const selected = annotations.find((a) => a.id === selectedId)
  const editingAnnotation = editing && annotations.find((a) => a.id === editing.id)

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        className="relative shrink-0 shadow-2xl ring-1 ring-border"
        style={{ width: image.width * scale, height: image.height * scale }}
      >
        <img
          src={image.url}
          alt="Image being annotated"
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full select-none"
        />
        <svg
          ref={svgRef}
          data-testid="annotation-canvas"
          viewBox={`0 0 ${image.width} ${image.height}`}
          className={cn(
            "absolute inset-0 size-full touch-none select-none",
            tool === "select" ? "cursor-default" : tool === "text" ? "cursor-text" : "cursor-crosshair",
          )}
          onPointerDown={handleBackgroundDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
        >
          {annotations.map((a) => (
            <AnnotationShape
              key={a.id}
              annotation={a}
              unit={unit}
              hitWidth={14 / scale}
              hidden={editing?.id === a.id}
              onPointerDown={handleShapeDown}
              onDoubleClick={(id) => {
                const target = annotations.find((x) => x.id === id)
                if (target?.type === "text") startEditing(id, false)
              }}
            />
          ))}
          {selected && !editing && (
            <SelectionOverlay
              annotation={selected}
              scale={scale}
              onCornerDown={handleCornerDown}
              onEndpointDown={handleEndpointDown}
            />
          )}
        </svg>
        {editingAnnotation && editingAnnotation.type === "text" && (
          <TextEditor
            key={editingAnnotation.id}
            annotation={editingAnnotation}
            scale={scale}
            onChange={(text) =>
              history.preview(
                updateIn(history.present, editingAnnotation.id, (a) =>
                  a.type === "text" ? { ...a, text } : a,
                ),
              )
            }
            onCommit={finishEditing}
          />
        )}
      </div>
    </div>
  )
}

function updateDraft(
  draft: Annotation,
  start: Point,
  p: Point,
  shift: boolean,
  scale: number,
): Annotation {
  switch (draft.type) {
    case "arrow": {
      if (!shift) return { ...draft, x2: p.x, y2: p.y }
      const angle = Math.round(Math.atan2(p.y - start.y, p.x - start.x) / (Math.PI / 4)) * (Math.PI / 4)
      const len = Math.hypot(p.x - start.x, p.y - start.y)
      return { ...draft, x2: start.x + Math.cos(angle) * len, y2: start.y + Math.sin(angle) * len }
    }
    case "rect":
    case "ellipse": {
      if (!shift) return { ...draft, ...normalizeBox(start, p) }
      const side = Math.max(Math.abs(p.x - start.x), Math.abs(p.y - start.y))
      const end = {
        x: start.x + Math.sign(p.x - start.x || 1) * side,
        y: start.y + Math.sign(p.y - start.y || 1) * side,
      }
      return { ...draft, ...normalizeBox(start, end) }
    }
    case "pen":
    case "highlighter": {
      const last = draft.points[draft.points.length - 1]
      if (Math.hypot(p.x - last.x, p.y - last.y) * scale < 2) return draft
      return { ...draft, points: [...draft.points, p] }
    }
    case "text":
      return draft
  }
}

function isTooSmall(a: Annotation, scale: number) {
  switch (a.type) {
    case "arrow":
      return Math.hypot(a.x2 - a.x1, a.y2 - a.y1) * scale < 6
    case "rect":
    case "ellipse":
      return a.w * scale < 4 && a.h * scale < 4
    default:
      return false
  }
}
