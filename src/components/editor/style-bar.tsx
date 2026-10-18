import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Copy,
  Layers,
  Pipette,
  Trash2,
  Type,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LayerMove } from "@/editor/annotations"
import { COLORS, FONT_LABELS, HIGHLIGHTER_COLORS } from "@/editor/constants"
import type { FontFamily, SizePreset, StylePatch, StyleValues } from "@/editor/types"
import { cn } from "@/lib/utils"


interface StyleBarProps {
  kind: "text" | "highlighter" | "stroke"
  values: StyleValues
  hasSelection: boolean
  onChange: (patch: StylePatch) => void
  onOpacityPreview: (opacity: number) => void
  onOpacityCommit: () => void
  onLayer: (move: LayerMove) => void
  onDuplicate: () => void
  onDelete: () => void
}

const SIZE_LABELS: Record<SizePreset, string> = { s: "Thin", m: "Medium", l: "Thick" }
const TEXT_SIZE_LABELS: Record<SizePreset, string> = { s: "Small", m: "Medium", l: "Large" }

export function StyleBar({
  kind,
  values,
  hasSelection,
  onChange,
  onOpacityPreview,
  onOpacityCommit,
  onLayer,
  onDuplicate,
  onDelete,
}: StyleBarProps) {
  const palette = kind === "highlighter" ? HIGHLIGHTER_COLORS : COLORS
  const isCustom = !palette.includes(values.color)
  const sizeLabels = kind === "text" ? TEXT_SIZE_LABELS : SIZE_LABELS

  return (
    <div
      role="toolbar"
      aria-label="Style"
      className="flex items-center gap-2 rounded-xl border bg-card/95 p-1.5 shadow-sm backdrop-blur"
    >
      <ToggleGroup
        type="single"
        value={isCustom ? "" : values.color}
        onValueChange={(color) => color && onChange({ color })}
        spacing={1}
        aria-label="Color"
      >
        {palette.map((color) => (
          <ToggleGroupItem
            key={color}
            value={color}
            aria-label={`Color ${color}`}
            className="size-8 min-w-8 p-0 data-[state=on]:bg-accent"
          >
            <span
              className="size-5 rounded-full ring-1 ring-border ring-inset"
              style={{ backgroundColor: color }}
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <label
            className={cn(
              "relative flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-muted",
              isCustom && "bg-accent",
            )}
          >
            <input
              type="color"
              aria-label="Custom color"
              value={values.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {isCustom ? (
              <span
                className="size-5 rounded-full ring-1 ring-border ring-inset"
                style={{ backgroundColor: values.color }}
              />
            ) : (
              <Pipette className="size-4 text-muted-foreground" />
            )}
          </label>
        </TooltipTrigger>
        <TooltipContent>Custom color</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6!" />

      <ToggleGroup
        type="single"
        value={values.size ?? ""}
        onValueChange={(size) => size && onChange({ size: size as SizePreset })}
        spacing={1}
        aria-label={kind === "text" ? "Text size" : "Thickness"}
      >
        {(["s", "m", "l"] as const).map((size) => (
          <Tooltip key={size}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={size} aria-label={sizeLabels[size]} className="size-8 min-w-8">
                {kind === "text" ? (
                  <Type className={cn(size === "s" && "size-3", size === "m" && "size-4", size === "l" && "size-5")} />
                ) : (
                  <span
                    className={cn(
                      "w-4 rounded-full bg-current",
                      size === "s" && "h-0.5",
                      size === "m" && "h-1",
                      size === "l" && "h-1.5",
                    )}
                  />
                )}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{sizeLabels[size]}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>

      {kind === "text" && (
        <>
          <Separator orientation="vertical" className="h-6!" />
          <Select
            value={values.fontFamily}
            onValueChange={(fontFamily) => onChange({ fontFamily: fontFamily as FontFamily })}
          >
            <SelectTrigger size="sm" aria-label="Font" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(FONT_LABELS) as FontFamily[]).map((font) => (
                <SelectItem key={font} value={font}>
                  {FONT_LABELS[font]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={values.background}
                onPressedChange={(background) => onChange({ background })}
                aria-label="Text background"
              >
                <span className="rounded-sm bg-foreground px-1 text-xs font-semibold text-background">
                  Aa
                </span>
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Background behind text</TooltipContent>
          </Tooltip>
        </>
      )}

      <Separator orientation="vertical" className="h-6!" />

      <div className="flex items-center gap-2 px-1">
        <span className="text-xs text-muted-foreground">Opacity</span>
        <Slider
          aria-label="Opacity"
          className="w-20"
          min={10}
          max={100}
          step={5}
          value={[Math.round(values.opacity * 100)]}
          onValueChange={([v]) => onOpacityPreview(v / 100)}
          onValueCommit={onOpacityCommit}
        />
        <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
          {Math.round(values.opacity * 100)}%
        </span>
      </div>

      {hasSelection && (
        <>
          <Separator orientation="vertical" className="h-6!" />
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Arrange">
                    <Layers />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Arrange</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onLayer("front")}>
                <ArrowUpToLine /> Bring to front
                <DropdownMenuShortcut>Shift ]</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onLayer("forward")}>
                <ArrowUp /> Bring forward
                <DropdownMenuShortcut>]</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onLayer("backward")}>
                <ArrowDown /> Send backward
                <DropdownMenuShortcut>[</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onLayer("back")}>
                <ArrowDownToLine /> Send to back
                <DropdownMenuShortcut>Shift [</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Duplicate" onClick={onDuplicate}>
                <Copy />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  )
}
