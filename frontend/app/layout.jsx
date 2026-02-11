import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
    title: 'CampusKart - Hyperlocal Student Marketplace',
    description: 'Buy and sell books, electronics, and hostel items within your college campus.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={outfit.className}>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 bg-background text-foreground">
                        {children}
                    </main>
                    <footer className="border-t py-6 md:py-0">
                        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row bg-background">
                            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                                Built for students. Open Source.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="font-medium underline underline-offset-4">Terms</a>
                                <a href="#" className="font-medium underline underline-offset-4">Privacy</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
