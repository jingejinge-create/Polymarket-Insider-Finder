import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Insider Radar | Polymarket Intelligence',
  description: 'Track potential insider trading activity on Polymarket prediction markets',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="scanlines" />
        {children}
      </body>
    </html>
  )
}
