import { HIGHLIGHTER_ALPHA } from "./constants"
import {
  arrowGeometry,
  strokePath,
  strokeWidthOf,
  textBackgroundFor,
  textLayout,
} from "./geometry"
import { canvasToPng, decodeImage } from "./load-image"
import type { Annotation, BaseImage } from "./types"

function drawAnnotation(ctx: CanvasRenderingContext2D, a: Annotation, unit: number) {
  const sw = strokeWidthOf(a, unit)
  ctx.save()
  ctx.globalAlpha = a.opacity
  ctx.strokeStyle = a.color
  ctx.fillStyle = a.color
  ctx.lineWidth = sw
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  switch (a.type) {
    case "arrow": {
      const { shaftEnd, headPoints } = arrowGeometry(a, sw)
      ctx.beginPath()
      ctx.moveTo(a.x1, a.y1)
      ctx.lineTo(shaftEnd.x, shaftEnd.y)
      ctx.stroke()
      ctx.beginPath()
      headPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
      ctx.closePath()
      ctx.lineWidth = sw * 0.5
      ctx.fill()
      ctx.stroke()
      break
    }
    case "rect":
      ctx.strokeRect(a.x, a.y, a.w, a.h)
      break
    case "ellipse":
      ctx.beginPath()
      ctx.ellipse(a.x + a.w / 2, a.y + a.h / 2, a.w / 2, a.h / 2, 0, 0, Math.PI * 2)
      ctx.stroke()
      break
    case "pen":
      ctx.stroke(new Path2D(strokePath(a.points)))
      break
    case "highlighter":
      ctx.globalAlpha = a.opacity * HIGHLIGHTER_ALPHA
      ctx.globalCompositeOperation = "multiply"
      ctx.stroke(new Path2D(strokePath(a.points)))
      break
    case "text": {
      const layout = textLayout(a)
      if (a.background) {
        ctx.fillStyle = textBackgroundFor(a.color)
        ctx.beginPath()
        ctx.roundRect(a.x, a.y, layout.width, layout.height, layout.pad * 0.6)
        ctx.fill()
      }
      ctx.fillStyle = a.color
      ctx.font = layout.font
      ctx.textBaseline = "alphabetic"
      layout.lines.forEach((line, i) => ctx.fillText(line, a.x + layout.pad, layout.baseline(i)))
      break
    }
  }
  ctx.restore()
}

export async function renderPng(
  image: BaseImage,
  annotations: Annotation[],
  unit: number,
): Promise<Blob> {
  const img = await decodeImage(image.url)
  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Your browser could not render the image.")
  ctx.drawImage(img, 0, 0, image.width, image.height)
  annotations.forEach((a) => drawAnnotation(ctx, a, unit))
  return canvasToPng(canvas)
}

export function exportFileName() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `markly-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.png`
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
