'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CredentialsReveal({
  email,
  password,
  onDone,
}: {
  email: string
  password: string
  onDone: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be denied; the password is still visible on screen.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-medium">Login created. This is the only time the password will be shown.</p>
        <p className="mt-1 text-xs text-muted-foreground">Copy it now, or reset the password later to get a new one.</p>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-medium text-muted-foreground">Email</span>
        <p className="rounded-lg border bg-muted/40 px-3 py-2 font-mono">{email}</p>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-xs font-medium text-muted-foreground">Password</span>
        <div className="flex items-center gap-2">
          <p className="flex-1 rounded-lg border bg-muted/40 px-3 py-2 font-mono">{password}</p>
          <Button type="button" variant="outline" size="icon" aria-label="Copy password" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  )
}
