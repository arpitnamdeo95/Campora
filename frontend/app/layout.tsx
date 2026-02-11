import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
    title: 'Campora - Peer-to-Peer Marketplace',
    description: 'The future of campus commerce. Buy and sell safely in your community.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary ${inter.variable}`}>
                <Navbar />
                <main className="flex-1 w-full">
                    {children}
                </main>
                <Toaster />
            </body>
        </html>
    )
}
