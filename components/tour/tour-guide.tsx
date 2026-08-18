'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useTour } from '@/lib/tour-context'
import { tourSteps, type TourPlacement, type TourStep } from '@/lib/tour'

type Box = { top: number; left: number; width: number; height: number }

function waitForElement(selector: string, timeoutMs = 2500) {
  return new Promise<Element | null>((resolve) => {
    const existing = document.querySelector(selector)
    if (existing) {
      resolve(existing)
      return
    }

    const started = Date.now()
    const frame = () => {
      const match = document.querySelector(selector)
      if (match) {
        resolve(match)
        return
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(null)
        return
      }
      window.requestAnimationFrame(frame)
    }
    window.requestAnimationFrame(frame)
  })
}

function paddedBox(element: Element): Box {
  const rect = element.getBoundingClientRect()
  const pad = 8
  return {
    top: Math.max(8, rect.top - pad),
    left: Math.max(8, rect.left - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  }
}

function tooltipPosition(highlight: Box, placement: TourPlacement, size: { width: number; height: number }) {
  const gap = 16
  const vw = window.innerWidth
  const vh = window.innerHeight
  let top = highlight.top
  let left = highlight.left

  if (placement === 'right') left = highlight.left + highlight.width + gap
  if (placement === 'left') left = highlight.left - size.width - gap
  if (placement === 'bottom') top = highlight.top + highlight.height + gap
  if (placement === 'top') top = highlight.top - size.height - gap

  if (placement === 'top' || placement === 'bottom') {
    left = highlight.left
  }
  if (placement === 'left' || placement === 'right') {
    top = highlight.top
  }

  return {
    top: Math.min(Math.max(12, top), Math.max(12, vh - size.height - 12)),
    left: Math.min(Math.max(12, left), Math.max(12, vw - size.width - 12)),
  }
}

export function TourGuide({ onNavOpen }: { onNavOpen: (open: boolean) => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const { active, stepIndex, total, next, prev, skip } = useTour()
  const step: TourStep | undefined = active ? tourSteps[stepIndex] : undefined
  const cardRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState<Box | null>(null)
  const [card, setCard] = useState({ top: 24, left: 24, width: 320, height: 200 })

  useEffect(() => {
    if (!step) return
    if (pathname !== step.route) {
      router.push(step.route)
    }
  }, [pathname, router, step])

  useEffect(() => {
    if (!active) {
      onNavOpen(false)
      return
    }
    if (!step) return
    const shouldOpenNav = Boolean(step.openNav) && window.innerWidth < 1024
    onNavOpen(shouldOpenNav)
  }, [active, onNavOpen, step])

  useLayoutEffect(() => {
    if (!step) {
      setHighlight(null)
      return
    }
    if (pathname !== step.route) {
      setHighlight(null)
      return
    }

    const selector = step.selector
    let cancelled = false

    async function measure() {
      const element = await waitForElement(selector)
      if (cancelled) return
      if (!element) {
        setHighlight(null)
        return
      }
      element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
      window.setTimeout(() => {
        if (cancelled) return
        setHighlight(paddedBox(element))
      }, 180)
    }

    void measure()

    function refresh() {
      const element = document.querySelector(selector)
      if (element) setHighlight(paddedBox(element))
    }

    window.addEventListener('resize', refresh)
    window.addEventListener('scroll', refresh, true)
    return () => {
      cancelled = true
      window.removeEventListener('resize', refresh)
      window.removeEventListener('scroll', refresh, true)
    }
  }, [pathname, step])

  useLayoutEffect(() => {
    if (!active || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const size = { width: rect.width, height: rect.height }
    const placement = step?.placement ?? 'bottom'
    const fallback: Box = {
      top: window.innerHeight / 2 - 80,
      left: window.innerWidth / 2 - 160,
      width: 320,
      height: 160,
    }
    const position = tooltipPosition(highlight ?? fallback, highlight ? placement : 'bottom', size)
    setCard({ ...position, width: size.width, height: size.height })
  }, [active, highlight, step])

  useEffect(() => {
    if (!active) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') skip()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') prev()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, next, prev, skip])

  if (!active || !step) return null

  const isLast = stepIndex === total - 1

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {highlight ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-primary transition-[top,left,width,height] duration-300"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            boxShadow: '0 0 0 9999px rgb(15 23 42 / 0.55)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-foreground/50" aria-hidden="true" />
      )}
      <div className="absolute inset-0" aria-hidden="true" />
      <div
        ref={cardRef}
        className="absolute z-[81] w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border bg-card p-4 shadow-xl"
        style={{ top: card.top, left: card.left }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          Step {stepIndex + 1} of {total}
        </p>
        <h2 id="tour-title" className="mt-2 text-base font-semibold tracking-tight">
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={skip} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            Skip
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prev} disabled={stepIndex === 0}>
              Back
            </Button>
            <Button size="sm" onClick={next}>
              {isLast ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
