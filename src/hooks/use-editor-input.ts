import { useEffect, useRef } from "react"

import { isAcceptedImage } from "@/editor/load-image"
import type { Tool } from "@/editor/types"

export interface EditorInputHandlers {
  enabled: boolean
  hasImage: boolean
  onImage: (file: Blob) => void
  onPasteWithoutImage: () => void
  onDragChange: (over: boolean) => void
  onTool: (tool: Tool) => void
  onUndo: () => void
  onRedo: () => void
  onCopy: () => void
  onDownload: () => void
  onDelete: () => void
  onDuplicate: () => void
  onEscape: () => void
  onLayer: (move: "front" | "forward" | "backward" | "back") => void
  onNudge: (dx: number, dy: number) => void
}

const TOOL_KEYS: Record<string, Tool> = {
  v: "select",
  a: "arrow",
  r: "rect",
  e: "ellipse",
  p: "pen",
  h: "highlighter",
  t: "text",
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

export function useEditorInput(handlers: EditorInputHandlers) {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const h = ref.current
      if (!h.enabled || isTypingTarget(e.target)) return
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()

      if (mod) {
        if (key === "z") {
          e.preventDefault()
          if (e.shiftKey) h.onRedo()
          else h.onUndo()
        } else if (key === "y") {
          e.preventDefault()
          h.onRedo()
        } else if (key === "c" && h.hasImage && !window.getSelection()?.toString()) {
          e.preventDefault()
          h.onCopy()
        } else if (key === "s" && h.hasImage) {
          e.preventDefault()
          h.onDownload()
        } else if (key === "d") {
          e.preventDefault()
          h.onDuplicate()
        }
        return
      }
      if (e.altKey) return

      if (key === "escape") return h.onEscape()
      if (key === "delete" || key === "backspace") {
        e.preventDefault()
        return h.onDelete()
      }
      if (e.key === "]") return h.onLayer("forward")
      if (e.key === "[") return h.onLayer("backward")
      if (e.key === "}") return h.onLayer("front")
      if (e.key === "{") return h.onLayer("back")

      const step = e.shiftKey ? 10 : 1
      const nudges: Record<string, [number, number]> = {
        arrowleft: [-step, 0],
        arrowright: [step, 0],
        arrowup: [0, -step],
        arrowdown: [0, step],
      }
      if (nudges[key]) {
        e.preventDefault()
        return h.onNudge(...nudges[key])
      }
      if (!e.shiftKey && TOOL_KEYS[key] && h.hasImage) h.onTool(TOOL_KEYS[key])
    }

    const onPaste = (e: ClipboardEvent) => {
      const h = ref.current
      if (!h.enabled || isTypingTarget(e.target)) return
      const files = Array.from(e.clipboardData?.files ?? [])
      const image = files.find(isAcceptedImage) ?? files.find((f) => f.type.startsWith("image/"))
      if (!image) {
        h.onPasteWithoutImage()
        return
      }
      e.preventDefault()
      h.onImage(image)
    }

    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files")
    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      ref.current.onDragChange(true)
    }
    const onDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) ref.current.onDragChange(false)
    }
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      const h = ref.current
      h.onDragChange(false)
      const file = e.dataTransfer?.files[0]
      if (file && h.enabled) h.onImage(file)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("paste", onPaste)
    window.addEventListener("dragover", onDragOver)
    window.addEventListener("dragleave", onDragLeave)
    window.addEventListener("drop", onDrop)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("paste", onPaste)
      window.removeEventListener("dragover", onDragOver)
      window.removeEventListener("dragleave", onDragLeave)
      window.removeEventListener("drop", onDrop)
    }
  }, [])
}
