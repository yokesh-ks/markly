import {
  ArrowLeft,
  ArrowRight,
  Ban,
  ClipboardCopy,
  EyeOff,
  FileX2,
  Link2Off,
  Lock,
  MousePointerClick,
  ServerOff,
  Sparkles,
  UserX,
  Users,
  Zap,
  Crosshair,
  type LucideIcon,
} from "lucide-react"

import { BrandMark } from "@/components/brand-mark"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"

const VALUES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Zap,
    title: "Instant",
    body: "No install, no account, no naming step. Open the page, paste, and you're marking up within seconds.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "There is no server for your image to reach. Privacy isn't a promise in a policy — it's how Markly is built.",
  },
  {
    icon: Crosshair,
    title: "Focused",
    body: "Arrows, boxes, ellipses, pen, highlighter, and text. The handful of tools that explain a screenshot, done well.",
  },
]

const STEPS: { icon: LucideIcon; title: string; body: React.ReactNode }[] = [
  {
    icon: ClipboardCopy,
    title: "Paste",
    body: (
      <>
        Take a screenshot with your usual tool, then press{" "}
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>V</Kbd>
        </KbdGroup>{" "}
        on Markly. Dropping a file works too.
      </>
    ),
  },
  {
    icon: MousePointerClick,
    title: "Mark it up",
    body: "Point with arrows, frame with boxes, highlight text, add a short label. Every mark stays editable.",
  },
  {
    icon: ArrowRight,
    title: "Copy and go",
    body: "Copy the result straight into Slack, email, or a ticket — or download a sharp PNG. Then close the tab.",
  },
]

const PRINCIPLES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ServerOff,
    title: "Nothing is uploaded",
    body: "Your image is opened and drawn entirely inside this browser tab.",
  },
  {
    icon: UserX,
    title: "No accounts",
    body: "There's nothing to sign up for, so there's no profile tied to what you annotate.",
  },
  {
    icon: EyeOff,
    title: "No tracking",
    body: "No analytics or third-party scripts watch what you do or see what you draw.",
  },
  {
    icon: Ban,
    title: "Nothing kept",
    body: "Close the tab and the image and marks are gone. Saving only happens when you choose to export.",
  },
]

const NOT_LIST: { icon: LucideIcon; label: string }[] = [
  { icon: Link2Off, label: "Shareable links or cloud history" },
  { icon: Users, label: "Real-time collaboration" },
  { icon: FileX2, label: "PDF or multi-page documents" },
  { icon: Sparkles, label: "AI edits or generated suggestions" },
]

const FAQ = [
  {
    q: "Where does my image go?",
    a: "Nowhere. Markly opens your image inside the browser tab you're using. It isn't sent to us or anyone else, because there's no server for it to be sent to.",
  },
  {
    q: "What happens when I close the tab?",
    a: "Everything is cleared — the image and all your marks. Markly won't ask to save, because keeping a copy is always your call. Copy or download before closing if you want to keep the result.",
  },
  {
    q: "Can I edit a mark after I've drawn it?",
    a: "Yes. Click any arrow, box, highlight, or label to move it, resize it, change its color or thickness, or delete it. Undo and redo work for every change.",
  },
  {
    q: "Why can't I share a link to my markup?",
    a: "A share link means storing your image on a server. That's exactly what Markly is designed to avoid, so it's a deliberate choice rather than a missing feature.",
  },
  {
    q: "What image types can I use?",
    a: "PNG, JPEG, WebP, and GIF (the first frame). Very large images are resized to 4096 pixels on the longest side so editing stays smooth, and the export size is always shown at the bottom of the editor.",
  },
]

export function AboutPage() {
  return (
    <div className="h-svh overflow-y-auto bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
          <a href="#" aria-label="Markly editor">
            <BrandMark />
          </a>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" asChild>
              <a href="#">
                <ArrowLeft />
                Back to editor
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b bg-muted/40 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[18px_18px]">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <Badge variant="outline" className="gap-1.5 bg-background py-1 text-muted-foreground">
                <Lock className="text-success" />
                About Markly
              </Badge>
              <h1 className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance lg:text-6xl">
                A shorter path from screenshot to answer.
              </h1>
              <p className="mt-6 text-xl text-muted-foreground">
                Markly is an image annotation tool for people who need to point at something and
                explain it clearly — without uploading their screenshot anywhere.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <a href="#">
                    Start annotating
                    <ArrowRight />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-background"
                  onClick={() =>
                    document.getElementById("privacy")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  How privacy works
                </Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
              <img
                src="/about-hero.webp"
                alt="A screenshot marked up with an arrow, a box, and a highlight, next to a padlock"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Why we built it</p>
              <h2 className="mt-2 scroll-m-20 text-3xl font-semibold tracking-tight">
                The screenshots you annotate most are the ones you shouldn't upload.
              </h2>
            </div>
            <div className="space-y-6 text-muted-foreground">
              <p className="leading-7">
                Internal dashboards. Customer records. Private messages, invoices, support tickets
                with account details. These are the images people mark up every day — and most
                annotation tools quietly send every one of them to a server to power links and
                history.
              </p>
              <p className="leading-7">
                That trade-off leaves people choosing between speed and privacy. Some upload
                anyway; others skip the screenshot and write a longer, less clear explanation.
                Markly removes the trade-off: it behaves like a local utility that happens to live
                in your browser.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="leading-6">{body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-muted-foreground">How it works</p>
          <h2 className="mt-2 scroll-m-20 text-3xl font-semibold tracking-tight">
            Paste, mark, copy, close.
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="privacy" className="scroll-mt-14 border-y bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">Our privacy principles</p>
              <h2 className="mt-2 scroll-m-20 text-3xl font-semibold tracking-tight">
                Private by architecture, not by policy.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                You shouldn't have to trust a privacy policy to annotate a screenshot. Markly
                has no place to store your image, so there's nothing to trust.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map(({ icon: Icon, title, body }) => (
                <Card key={title} className="flex-row items-start gap-4 px-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">What Markly isn't</p>
              <h2 className="mt-2 scroll-m-20 text-3xl font-semibold tracking-tight">
                Saying no is part of the product.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Every one of these features would need your image to live somewhere other than
                your browser. Leaving them out is what keeps Markly fast, simple, and private.
              </p>
              <ul className="mt-8 grid gap-3">
                {NOT_LIST.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Questions</p>
              <h2 className="mt-2 scroll-m-20 text-3xl font-semibold tracking-tight">
                Frequently asked
              </h2>
              <Accordion type="single" collapsible className="mt-6">
                {FAQ.map(({ q, a }) => (
                  <AccordionItem key={q} value={q}>
                    <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                    <AccordionContent className="leading-7 text-muted-foreground">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-start gap-6 p-10 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Got a screenshot to explain?</h2>
                <p className="mt-2 text-primary-foreground/70">
                  Open the editor and paste it in. Nothing leaves your device.
                </p>
              </div>
              <Button size="lg" variant="secondary" asChild>
                <a href="#">
                  Open the editor
                  <ArrowRight />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <BrandMark />
          <p>Runs entirely in your browser. Nothing is uploaded.</p>
        </div>
      </footer>
    </div>
  )
}
