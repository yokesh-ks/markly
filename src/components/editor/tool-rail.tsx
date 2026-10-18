import {
  ArrowUpRight,
  Circle,
  Highlighter,
  MousePointer2,
  PenLine,
  Square,
  Type,
  type LucideIcon,
} from "lucide-react"

import { Kbd } from "@/components/ui/kbd"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Tool } from "@/editor/types"

export const TOOLS: { id: Tool; label: string; key: string; icon: LucideIcon }[] = [
  { id: "select", label: "Select", key: "V", icon: MousePointer2 },
  { id: "arrow", label: "Arrow", key: "A", icon: ArrowUpRight },
  { id: "rect", label: "Rectangle", key: "R", icon: Square },
  { id: "ellipse", label: "Ellipse", key: "E", icon: Circle },
  { id: "pen", label: "Pen", key: "P", icon: PenLine },
  { id: "highlighter", label: "Highlighter", key: "H", icon: Highlighter },
  { id: "text", label: "Text", key: "T", icon: Type },
]

interface ToolRailProps {
  tool: Tool
  onToolChange: (tool: Tool) => void
}

export function ToolRail({ tool, onToolChange }: ToolRailProps) {
  return (
    <ToggleGroup
      type="single"
      value={tool}
      onValueChange={(value) => value && onToolChange(value as Tool)}
      orientation="vertical"
      spacing={1}
      aria-label="Annotation tools"
      className="flex-col rounded-xl border bg-card p-1.5 shadow-sm"
    >
      {TOOLS.map(({ id, label, key, icon: Icon }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value={id}
              aria-label={label}
              className="size-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Icon />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {label}
            <Kbd>{key}</Kbd>
          </TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}
