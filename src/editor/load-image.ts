import { MAX_EDGE } from "./constants"
import type { BaseImage } from "./types"

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

export function isAcceptedImage(file: Blob) {
  return ACCEPTED_TYPES.includes(file.type)
}

export function decodeImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("This image could not be opened."))
    img.src = url
  })
}

export function canvasToPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image."))),
      "image/png",
    )
  })
}

export async function loadBaseImage(file: Blob): Promise<BaseImage> {
  if (!isAcceptedImage(file)) {
    throw new Error("Please use a PNG, JPEG, WebP, or GIF image.")
  }
  const sourceUrl = URL.createObjectURL(file)
  try {
    const img = await decodeImage(sourceUrl)
    const { naturalWidth: w, naturalHeight: h } = img
    if (!w || !h) throw new Error("This image appears to be empty.")
    const longest = Math.max(w, h)
    if (longest <= MAX_EDGE && file.type !== "image/gif") {
      return { url: sourceUrl, width: w, height: h, downscaled: false }
    }
    const scale = Math.min(1, MAX_EDGE / longest)
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(w * scale)
    canvas.height = Math.round(h * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Your browser could not prepare this image.")
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await canvasToPng(canvas)
    URL.revokeObjectURL(sourceUrl)
    return {
      url: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
      downscaled: scale < 1,
    }
  } catch (error) {
    URL.revokeObjectURL(sourceUrl)
    throw error
  }
}
