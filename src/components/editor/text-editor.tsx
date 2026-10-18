import { useEffect, useRef } from "react"

import { FONT_STACKS, FONT_WEIGHT } from "@/editor/constants"
import { textBackgroundFor, textLayout } from "@/editor/geometry"
import type { TextAnnotation } from "@/editor/types"

interface TextEditorProps {
  annotation: TextAnnotation
  scale: number
  onChange: (text: string) => void
  onCommit: () => void
}

export function TextEditor({ annotation: a, scale, onChange, onCommit }: TextEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const layout = textLayout(a)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  return (
    <textarea
      ref={ref}
      aria-label="Annotation text"
      placeholder="Type here"
      value={a.text}
      spellCheck={false}
      rows={1}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === "Escape" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
          e.preventDefault()
          onCommit()
        }
      }}
      className="absolute resize-none overflow-hidden whitespace-pre outline-2 outline-offset-2 outline-selection outline-dashed placeholder:opacity-50"
      style={{
        left: a.x * scale,
        top: a.y * scale,
        width: layout.width * scale + a.fontSize * scale,
        height: layout.height * scale,
        padding: layout.pad * scale,
        font: `${FONT_WEIGHT} ${a.fontSize * scale}px ${FONT_STACKS[a.fontFamily]}`,
        lineHeight: 1.25,
        color: a.color,
        opacity: a.opacity,
        background: a.background ? textBackgroundFor(a.color) : "transparent",
        borderRadius: layout.pad * 0.6 * scale,
      }}
    />
  )
}
