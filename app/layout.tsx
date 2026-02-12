import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OAC Maputo - Super Taça Jovem',
  description: 'Sistema de gestão do campeonato da OAC Maputo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className="antialiased">
        <div suppressHydrationWarning>
          {children}
        </div>
      </body>
    </html>
  )
}