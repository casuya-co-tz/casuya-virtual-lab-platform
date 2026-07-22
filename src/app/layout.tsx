import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { WebVitals } from '@/components/shared/WebVitals'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Casuya Virtual Laboratory',
  description: 'NECTA-aligned science simulations for Tanzanian secondary schools.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg' },
}

export const viewport = {
  themeColor: '#3B82F6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        {children}
        <WebVitals />
        <script src="/js/init.js" />
      </body>
    </html>
  )
}
