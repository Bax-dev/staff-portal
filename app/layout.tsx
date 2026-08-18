import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { AppearanceProvider } from '@/lib/appearance-context'
import { Toaster } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: 'SMP | Staff Management Portal',
  description: 'Professional staff records and workforce administration.',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

const appearanceScript = `(function(){try{var t=localStorage.getItem('smp-theme');var f=localStorage.getItem('smp-font-size');var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t==='dark'?'dark':'light');if(f==='small'||f==='medium'||f==='large'||f==='xlarge'){r.setAttribute('data-font-size',f)}else{r.setAttribute('data-font-size','medium')}}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AppearanceProvider>
            <Toaster>{children}</Toaster>
          </AppearanceProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
