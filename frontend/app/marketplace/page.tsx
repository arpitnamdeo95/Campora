"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Filter,
    Search,
    Flame,
    Loader2,
    Heart,
    Eye,
    ArrowUpRight,
    Sparkles,
    SlidersHorizontal,
    Zap
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { WishlistButton } from "@/components/WishlistButton"
import { TrustBadge } from "@/components/TrustBadge"
import RecentlySoldSection from "@/components/RecentlySoldSection"
import { ListingCard } from "@/components/ListingCard"

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([])
    const [trending, setTrending] = useState<any[]>([])
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || 'all',
        sort: 'newest'
    })

    useEffect(() => {
        const stored = localStorage.getItem('recently_viewed')
        if (stored) setRecentlyViewed(JSON.parse(stored).slice(0, 4))
        api.get('/listings?sort=demand_desc').then(data => setTrending(data.slice(0, 3)))
    }, [])

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true)
            try {
                const query = new URLSearchParams()
                if (filters.search) query.append('search', filters.search)
                if (filters.category !== 'all') query.append('category', filters.category)
                query.append('sort', filters.sort)
                const data = await api.get(`/listings?${query.toString()}`)
                setListings(data)
            } catch (error) {
                console.error("Failed to load listings", error)
            } finally {
                setLoading(false)
            }
        }
        const timeout = setTimeout(fetchListings, 500)
        return () => clearTimeout(timeout)
    }, [filters])

    return (
        <div className="min-h-screen bg-background pb-20 pt-20">
            {/* Sticky Header with Search - adjusted top offset to clear navbar */}
            <div className="bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-[72px] z-30 transition-all duration-300">
                <div className="container px-4 mx-auto max-w-7xl py-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        <div className="space-y-3">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1">Community Loop</Badge>
                            <h1 className="text-3xl lg:text-5xl font-black tracking-tighter leading-none">Marketplace.</h1>
                            <p className="text-muted-foreground font-medium text-sm lg:text-base max-w-lg">Premium items from verified users in your area.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 sm:w-80 lg:w-[400px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search items..."
                                    className="pl-12 h-14 rounded-2xl bg-secondary/50 border-none focus-visible:ring-primary shadow-inner text-sm font-bold"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                            <Button variant="outline" className="h-14 px-6 rounded-2xl border-dashed border-2 hover:bg-secondary/50 font-bold">
                                <SlidersHorizontal className="h-4 w-4 mr-2" /> Sort & Filter
                            </Button>
                        </div>
                    </div>

                    {/* Categories Row */}
                    <div className="flex gap-3 mt-8 overflow-x-auto pb-4 scrollbar-none no-scrollbar">
                        {['all', 'Books', 'Electronics', 'Notes', 'Furniture'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilters(p => ({ ...p, category: cat }))}
                                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${filters.category === cat
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-primary'
                                    }`}
                            >
                                {cat === 'all' ? 'All Items' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container px-4 mx-auto max-w-7xl py-12 flex flex-col lg:flex-row gap-12">
                {/* Main Content */}
                <div className="flex-1 space-y-12">
                    {/* Trending Section */}
                    {trending.length > 0 && !filters.search && filters.category === 'all' && (
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
                                <Flame className="h-6 w-6 text-orange-500 fill-orange-500" /> Hot Right Now
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {trending.map((item) => (
                                    <ListingCard key={item.id} item={item} variant="wide" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Results Section */}
                    <section className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-black">
                                {loading ? 'Fetching...' : <span>{listings.length} <span className="text-muted-foreground font-bold text-sm ml-2 italic">items found</span></span>}
                            </h2>
                            <div className="bg-secondary/50 p-1 px-3 rounded-xl border border-border/50">
                                <span className="text-[10px] font-black uppercase text-muted-foreground mr-2">Sort:</span>
                                <select
                                    className="bg-transparent text-[10px] font-black outline-none cursor-pointer uppercase tracking-widest"
                                    value={filters.sort}
                                    onChange={(e) => setFilters(p => ({ ...p, sort: e.target.value }))}
                                >
                                    <option value="newest">Latest Arrivals</option>
                                    <option value="price_asc">Lowest Price</option>
                                    <option value="price_desc">Highest Price</option>
                                    <option value="demand_desc">Popularity</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-80 rounded-[2.5rem] bg-card border border-border/50 animate-pulse" />
                                ))}
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center bg-card rounded-[3.5rem] border border-dashed border-border/50">
                                <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-black mb-2">No items found</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto font-medium">Try broadening your search or switching categories.</p>
                                <Button variant="link" onClick={() => setFilters({ search: '', category: 'all', sort: 'newest' })} className="mt-4 font-bold">
                                    Clear all filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {listings.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ListingCard item={item} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>

                    {/* Recently Sold Section */}
                    <RecentlySoldSection />
                </div>

                {/* Left Side Info Panel */}
                <aside className="lg:w-80 space-y-8">
                    {recentlyViewed.length > 0 && (
                        <section className="bg-card p-6 rounded-[2.5rem] border border-border/50 shadow-xl shadow-black/5 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Eye className="h-3 w-3 text-primary" /> Recent History
                            </h3>
                            <div className="space-y-4">
                                {recentlyViewed.map((item) => (
                                    <Link key={item.id} href={`/listing/${item.id}`} className="flex gap-4 group items-center">
                                        <div className="h-14 w-14 rounded-2xl bg-secondary flex-shrink-0 overflow-hidden ring-1 ring-border/10">
                                            <img src={item.image} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-125" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-xs line-clamp-1 group-hover:text-primary transition-colors">{item.title}</div>
                                            <div className="text-primary font-black text-xs mt-0.5">₹{item.price}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="h-24 w-24" />
                        </div>
                        <h4 className="font-black text-xl mb-3 relative z-10 leading-tight">AI Fair Price engine is active.</h4>
                        <p className="text-white/80 text-xs mb-6 relative z-10 font-bold leading-relaxed">
                            Our engine ensures you never overpay. Look for the "Fair Price" badge on listings.
                        </p>
                        <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-black text-xs h-12 uppercase tracking-widest">
                            How it works
                        </Button>
                    </div>
                </aside>
            </div>
        </div >
    )
}


