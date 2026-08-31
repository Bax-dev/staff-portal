import Image from 'next/image'

export function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image src="/NDBDA LOGO.jpeg" alt="NDBDA logo" width={44} height={44} className="size-11 shrink-0 rounded-full object-cover" />
          <div>
            <p className="font-semibold tracking-tight">SMP</p>
            <p className="text-xs text-muted-foreground">Staff Management Portal</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
