import { ImageUp, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

interface EmptyStateProps {
  modKey: string
  onChooseFile: () => void
}

export function EmptyState({ modKey, onChooseFile }: EmptyStateProps) {
  return (
    <Empty className="m-8 max-w-xl border-2 border-dashed bg-background/80 backdrop-blur">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-14 rounded-2xl">
          <ImageUp className="size-7!" />
        </EmptyMedia>
        <EmptyTitle className="text-xl">Paste an image or drop a file here</EmptyTitle>
        <EmptyDescription className="flex items-center justify-center gap-2">
          Press
          <KbdGroup>
            <Kbd>{modKey}</Kbd>
            <Kbd>V</Kbd>
          </KbdGroup>
          anywhere on this page to start
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onChooseFile}>
          Choose a file
        </Button>
        <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, or GIF</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-success" />
          Stays on your device. Nothing is uploaded, and closing the tab clears it.
        </p>
      </EmptyContent>
    </Empty>
  )
}
