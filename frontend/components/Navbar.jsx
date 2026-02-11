'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { ShoppingBag, MessageCircle, User, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            return () => subscription.unsubscribe();
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    };

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl tracking-tight">CampusKart</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Marketplace
                        </Link>
                        {user && (
                            <Link href="/create-listing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                Sell Item
                            </Link>
                        )}
                    </div>

                    {/* Auth / Profile Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link href="/chat">
                                    <button className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                                        <MessageCircle className="h-5 w-5" />
                                    </button>
                                </Link>

                                <div className="relative group">
                                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors">
                                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                    </button>
                                    {/* Dropdown would go here - simplified for MVP */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-md shadow-lg py-1 hidden group-hover:block">
                                        <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                                            <User className="h-4 w-4" /> Profile
                                        </Link>
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2">
                                            <LogOut className="h-4 w-4" /> Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Link href="/auth">
                                <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                    Login
                                </button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t">
                    <div className="space-y-1 px-2 pb-3 pt-2">
                        <Link href="/marketplace" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted">
                            Marketplace
                        </Link>
                        {user && (
                            <>
                                <Link href="/create-listing" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted">
                                    Sell Item
                                </Link>
                                <Link href="/chat" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted">
                                    Messages
                                </Link>
                                <Link href="/profile" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted">
                                    Profile
                                </Link>
                                <button onClick={handleLogout} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/10">
                                    Logout
                                </button>
                            </>
                        )}
                        {!user && (
                            <Link href="/auth" className="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-primary/10">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
