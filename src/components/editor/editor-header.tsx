import { Check, Copy, Download, ImagePlus, Lock, Redo2, Undo2 } from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface EditorHeaderProps {
  hasImage: boolean
  canUndo: boolean
  canRedo: boolean
  copied: boolean
  modKey: string
  onUndo: () => void
  onRedo: () => void
  onOpen: () => void
  onCopy: () => void
  onDownload: () => void
}

export function EditorHeader({
  hasImage,
  canUndo,
  canRedo,
  copied,
  modKey,
  onUndo,
  onRedo,
  onOpen,
  onCopy,
  onDownload,
}: EditorHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
            <path
              d="M4 18 L10 8 L14 14 L20 5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="5" r="2" fill="currentColor" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">Markly</span>
      </div>

      <HoverCard openDelay={150}>
        <HoverCardTrigger asChild>
          <Badge variant="outline" className="cursor-default gap-1.5 py-1 text-muted-foreground">
            <Lock className="text-success" />
            Local only — nothing is uploaded
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 text-sm" align="start">
          <p className="font-medium">Your image never leaves this tab.</p>
          <p className="mt-2 text-muted-foreground">
            Markly has no server to send it to. Everything happens in your browser, and closing
            the tab clears the image and your marks. Copy or download to keep a result.
          </p>
        </HoverCardContent>
      </HoverCard>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Undo" disabled={!canUndo} onClick={onUndo}>
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            Undo
            <KbdGroup>
              <Kbd>{modKey}</Kbd>
              <Kbd>Z</Kbd>
            </KbdGroup>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Redo" disabled={!canRedo} onClick={onRedo}>
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            Redo
            <KbdGroup>
              <Kbd>Shift</Kbd>
              <Kbd>{modKey}</Kbd>
              <Kbd>Z</Kbd>
            </KbdGroup>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6!" />

        <Button variant="ghost" onClick={onOpen}>
          <ImagePlus />
          <span className="hidden sm:inline">{hasImage ? "New image" : "Open image"}</span>
        </Button>
        <Button variant="outline" disabled={!hasImage} onClick={onDownload}>
          <Download />
          <span className="hidden sm:inline">Download</span>
        </Button>
        <Button disabled={!hasImage} onClick={onCopy} className="min-w-32">
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy image"}
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6!" />
        <ModeToggle />
      </div>
    </header>
  )
}
