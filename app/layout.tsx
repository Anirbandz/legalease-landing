import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '../components/UserProvider'
import { Button } from '../components/ui/button'
import { Toaster } from '../components/ui/toaster'

export const metadata: Metadata = {
  title: 'LegalEase AI – AI Legal Document Summarizer India',
  description: 'Upload contracts, NDAs, rental agreements and get instant AI summaries. Designed for Indian users. Free trial available.',
  generator: 'v0.dev',
}

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="icon" href="/logo.ico" sizes="any" />
      </head>
      <body>
        <UserProvider>
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  )
}
