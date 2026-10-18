import { useRef, useState } from "react"
import { ImageDown } from "lucide-react"
import { toast } from "sonner"

import { EditorHeader } from "@/components/editor/editor-header"
import { EmptyState } from "@/components/editor/empty-state"
import { Stage } from "@/components/editor/stage"
import { StyleBar } from "@/components/editor/style-bar"
import { ToolRail } from "@/components/editor/tool-rail"
import { useTheme } from "@/components/theme-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  applyStylePatch,
  duplicateIn,
  fontPresetFor,
  moveLayer,
  updateIn,
  type LayerMove,
} from "@/editor/annotations"
import { DEFAULT_STYLE, unitFor } from "@/editor/constants"
import { downloadBlob, exportFileName, renderPng } from "@/editor/export"
import { translate } from "@/editor/geometry"
import { loadBaseImage } from "@/editor/load-image"
import type {
  Annotation,
  BaseImage,
  StylePatch,
  StyleSettings,
  StyleValues,
  Tool,
} from "@/editor/types"
import { useEditorInput } from "@/hooks/use-editor-input"
import { useHistory } from "@/hooks/use-history"

const MOD_KEY = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"

export function App() {
  const { theme } = useTheme()
  const [image, setImage] = useState<BaseImage | null>(null)
  const history = useHistory<Annotation[]>([])
  const annotations = history.present
  const [tool, setTool] = useState<Tool>("arrow")
  const [style, setStyle] = useState<StyleSettings>(DEFAULT_STYLE)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<Blob | null>(null)
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [cancelSignal, setCancelSignal] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const copiedTimer = useRef<number | undefined>(undefined)
  const sliding = useRef(false)

  const unit = image ? unitFor(image.width, image.height) : 1
  const selected = annotations.find((a) => a.id === selectedId) ?? null

  const openImage = async (file: Blob) => {
    try {
      const next = await loadBaseImage(file)
      if (image) URL.revokeObjectURL(image.url)
      setImage(next)
      history.reset([])
      setSelectedId(null)
      setTool("arrow")
      if (next.downscaled) {
        toast.info(`Large image resized to ${next.width} × ${next.height} px for smooth editing.`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "This image could not be opened.")
    }
  }

  const requestImage = (file: Blob) => {
    if (annotations.length > 0) setPendingFile(file)
    else void openImage(file)
  }

  const downloadFallback = (render: Promise<Blob>, message: string) => {
    render
      .then((blob) => {
        downloadBlob(blob, exportFileName())
        toast.info(message)
      })
      .catch(() => toast.error("Something went wrong while creating the image."))
  }

  const copyImage = () => {
    if (!image) return
    const render = renderPng(image, annotations, unit)
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      downloadFallback(render, "Your browser can't copy images, so it was downloaded instead.")
      return
    }
    navigator.clipboard
      .write([new ClipboardItem({ "image/png": render })])
      .then(() => {
        setCopied(true)
        window.clearTimeout(copiedTimer.current)
        copiedTimer.current = window.setTimeout(() => setCopied(false), 2000)
      })
      .catch(() =>
        downloadFallback(render, "Copying wasn't allowed by your browser, so it was downloaded instead."),
      )
  }

  const downloadImage = () => {
    if (!image) return
    renderPng(image, annotations, unit)
      .then((blob) => downloadBlob(blob, exportFileName()))
      .catch(() => toast.error("Something went wrong while creating the image."))
  }

  const styleKind =
    (selected?.type ?? tool) === "text"
      ? "text"
      : (selected?.type ?? tool) === "highlighter"
        ? "highlighter"
        : "stroke"

  const styleValues: StyleValues = selected
    ? {
        color: selected.color,
        opacity: selected.opacity,
        size: selected.type === "text" ? fontPresetFor(selected.fontSize, unit) : selected.size,
        fontFamily: selected.type === "text" ? selected.fontFamily : style.fontFamily,
        background: selected.type === "text" ? selected.background : style.textBackground,
      }
    : {
        color: styleKind === "highlighter" ? style.highlighterColor : style.color,
        opacity: style.opacity,
        size: style.size,
        fontFamily: style.fontFamily,
        background: style.textBackground,
      }

  const applyStyle = (patch: StylePatch, mode: "commit" | "preview" = "commit") => {
    setStyle((s) => ({
      ...s,
      color: patch.color && styleKind !== "highlighter" ? patch.color : s.color,
      highlighterColor: patch.color && styleKind === "highlighter" ? patch.color : s.highlighterColor,
      size: patch.size ?? s.size,
      fontFamily: patch.fontFamily ?? s.fontFamily,
      textBackground: patch.background ?? s.textBackground,
      opacity: !selected && patch.opacity !== undefined ? patch.opacity : s.opacity,
    }))
    if (!selected) return
    const next = updateIn(annotations, selected.id, (a) => applyStylePatch(a, patch, unit))
    if (mode === "commit") history.set(next)
    else history.preview(next)
  }

  const previewOpacity = (opacity: number) => {
    if (selected && !sliding.current) {
      history.begin()
      sliding.current = true
    }
    applyStyle({ opacity }, "preview")
  }

  const commitOpacity = () => {
    if (!sliding.current) return
    sliding.current = false
    history.end()
  }

  const deleteSelected = () => {
    if (!selected) return
    history.set(annotations.filter((a) => a.id !== selected.id))
    setSelectedId(null)
  }

  const duplicateSelected = () => {
    if (!selected) return
    const result = duplicateIn(annotations, selected.id, 16 * unit)
    if (!result) return
    history.set(result.list)
    setSelectedId(result.id)
  }

  const layerSelected = (move: LayerMove) => {
    if (!selected) return
    const next = moveLayer(annotations, selected.id, move)
    if (next !== annotations) history.set(next)
  }

  useEditorInput({
    enabled: pendingFile === null,
    hasImage: image !== null,
    onImage: requestImage,
    onPasteWithoutImage: () => toast.info("There's no image on your clipboard to paste."),
    onDragChange: setDragOver,
    onTool: setTool,
    onUndo: history.undo,
    onRedo: history.redo,
    onCopy: copyImage,
    onDownload: downloadImage,
    onDelete: deleteSelected,
    onDuplicate: duplicateSelected,
    onEscape: () => {
      setCancelSignal((n) => n + 1)
      setSelectedId(null)
    },
    onLayer: layerSelected,
    onNudge: (dx, dy) => {
      if (!selected) return
      history.set(updateIn(annotations, selected.id, (a) => translate(a, dx * unit, dy * unit)))
    },
  })

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
        <EditorHeader
          hasImage={image !== null}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          copied={copied}
          modKey={MOD_KEY}
          onUndo={history.undo}
          onRedo={history.redo}
          onOpen={() => fileInput.current?.click()}
          onCopy={copyImage}
          onDownload={downloadImage}
        />

        <main className="relative flex-1 overflow-hidden bg-muted/50 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[18px_18px]">
          {image ? (
            <>
              <div className="absolute inset-0 top-14 left-16">
                <Stage
                  image={image}
                  history={history}
                  tool={tool}
                  style={style}
                  unit={unit}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelectedId}
                  cancelSignal={cancelSignal}
                />
              </div>
              <div className="absolute top-1/2 left-3 -translate-y-1/2">
                <ToolRail tool={tool} onToolChange={setTool} />
              </div>
              <div className="absolute top-3 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 overflow-x-auto">
                <StyleBar
                  kind={styleKind}
                  values={styleValues}
                  hasSelection={selected !== null}
                  onChange={(patch) => applyStyle(patch)}
                  onOpacityPreview={previewOpacity}
                  onOpacityCommit={commitOpacity}
                  onLayer={layerSelected}
                  onDuplicate={duplicateSelected}
                  onDelete={deleteSelected}
                />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState modKey={MOD_KEY} onChooseFile={() => fileInput.current?.click()} />
            </div>
          )}

          {dragOver && (
            <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 text-center">
                <ImageDown className="size-10" />
                <p className="text-lg font-semibold">Drop to open</p>
                <p className="text-sm text-muted-foreground">It stays on your device</p>
              </div>
            </div>
          )}
        </main>

        <footer className="flex h-9 shrink-0 items-center gap-4 border-t bg-background px-4 text-xs text-muted-foreground">
          {image ? (
            <>
              <span className="tabular-nums">
                Exports at {image.width} × {image.height} px PNG
                {image.downscaled && " (resized from a larger original)"}
              </span>
              <span className="tabular-nums">
                {annotations.length} {annotations.length === 1 ? "mark" : "marks"}
              </span>
              <span className="ml-auto hidden md:inline">
                Hold Shift to straighten · Double-click text to edit · Arrow keys nudge
              </span>
            </>
          ) : (
            <span>Closing this tab clears everything. Nothing is saved or sent anywhere.</span>
          )}
        </footer>

        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) requestImage(file)
            e.target.value = ""
          }}
        />

        <AlertDialog open={pendingFile !== null} onOpenChange={(open) => !open && setPendingFile(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Replace the current image?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current marks will be cleared. Copy or download first if you want to keep
                them.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingFile) void openImage(pendingFile)
                  setPendingFile(null)
                }}
              >
                Replace image
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster theme={theme} position="bottom-center" />
      </div>
    </TooltipProvider>
  )
}

export default App
