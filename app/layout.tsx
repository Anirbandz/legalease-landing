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
        <link rel="canonical" href="https://www.ease-ai.in/" />
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LegalEase AI – AI Legal Document Summarizer India" />
        <meta name="twitter:description" content="Upload contracts, NDAs, rental agreements and get instant AI summaries. Designed for Indian users. Free trial available." />
        <meta name="twitter:image" content="/og-image.png" />
        {/* JSON-LD Structured Data for Organization */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'LegalEase AI',
          url: 'https://www.ease-ai.in/',
          logo: 'https://www.ease-ai.in/logo.svg',
          description: 'AI-powered legal document summarizer for Indian users.'
        }) }} />
      </head>
      <body>
        <header>{/* Navigation will be rendered by children */}</header>
        <main>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </main>
      </body>
    </html>
  )
}
