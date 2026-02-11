"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    ShoppingBag,
    MessageSquare,
    PlusCircle,
    User,
    LogOut,
    Menu,
    X,
    Heart,
    Zap,
    LayoutGrid,
    Search
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "./ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "./ThemeToggle"
import { NotificationDropdown } from "./NotificationDropdown"

export default function Navbar() {
    const [user, setUser] = React.useState<any>(null)
    const pathname = usePathname()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)

        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null)
            })

            return () => subscription.unsubscribe()
        }
        getUser()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    const isActive = (path: string) => pathname === path

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b shadow-sm py-2'
            : 'bg-transparent py-4'
            }`}>
            <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">

                {/* Logo */}
                <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                        <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Campora
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl border border-black/5">
                    {[
                        ...(user ? [{ name: 'Dashboard', href: '/dashboard', icon: LayoutGrid }] : []),
                        { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
                        { name: 'Sell Item', href: '/sell', icon: PlusCircle },
                    ].map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isActive(link.href)
                                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Right Actions */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            <ThemeToggle />

                            <Link href="/wishlist">
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl relative text-slate-400 hover:text-red-500 hover:bg-red-50">
                                    <Heart className="h-5 w-5" />
                                </Button>
                            </Link>

                            <NotificationDropdown />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 hover:bg-slate-100 transition-colors">
                                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                            <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                                            <AvatarFallback className="bg-primary text-white font-bold">{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 p-2 rounded-2xl mt-2 border-slate-200 shadow-2xl" align="end">
                                    <DropdownMenuLabel className="font-normal p-4">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-black leading-none">{user.user_metadata?.name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="mx-2" />
                                    <div className="p-1">
                                        <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl py-3 cursor-pointer">
                                            <User className="mr-3 h-4 w-4 text-slate-400" />
                                            <span className="font-semibold text-sm">Your Profile</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push('/sell')} className="rounded-xl py-3 cursor-pointer">
                                            <PlusCircle className="mr-3 h-4 w-4 text-slate-400" />
                                            <span className="font-semibold text-sm">List New Item</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="my-2" />
                                        <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span className="font-bold text-sm">Sign Out</span>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link href="/login">
                                <Button variant="ghost" className="rounded-xl font-bold px-6">Log in</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Content */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t bg-white overflow-hidden"
                    >
                        <div className="p-6 space-y-4">
                            <Link href="/marketplace" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-lg font-bold p-4 bg-slate-50 rounded-2xl">
                                <LayoutGrid className="h-5 w-5 text-primary" /> Marketplace
                            </Link>
                            <Link href="/sell" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-lg font-bold p-4 bg-slate-50 rounded-2xl">
                                <PlusCircle className="h-5 w-5 text-primary" /> Sell Item
                            </Link>
                            {user ? (
                                <>
                                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-lg font-bold p-4 bg-slate-50 rounded-2xl">
                                        <User className="h-5 w-5 text-primary" /> Profile
                                    </Link>
                                    <Link href="/chat" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-lg font-bold p-4 bg-slate-50 rounded-2xl">
                                        <MessageSquare className="h-5 w-5 text-primary" /> Messages
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-4 text-lg font-bold p-4 bg-red-50 text-red-600 rounded-2xl w-full text-left">
                                        <LogOut className="h-5 w-5" /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Log in</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full h-12 rounded-xl font-bold">Sign Up</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
