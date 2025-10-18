import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '3D Chess Game - Multiplayer',
  description: 'A full-stack 3D chess game with multiplayer support built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
