export function BrandMark() {
  return (
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
  )
}
