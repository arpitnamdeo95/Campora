"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ListingCard } from "@/components/ListingCard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    LayoutGrid,
    PlusCircle,
    ShoppingBag,
    Heart,
    Clock,
    TrendingUp,
    MessageSquare,
    Zap
} from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        activeListings: 0,
        wishlistCount: 0,
        unreadMessages: 0,
        totalViews: 0
    })
    const [recommended, setRecommended] = useState<any[]>([])
    const [myListings, setMyListings] = useState<any[]>([])

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.replace('/login')
                return
            }
            setUser(session.user)

            // Fetch Stats & Data
            const userId = session.user.id

            // 1. My Listings
            const { data: listings } = await supabase
                .from('listings')
                .select('id, title, status, view_count, created_at, images, expected_price')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            const activeCount = listings?.filter(l => l.status === 'available').length || 0
            const totalViews = listings?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0
            setMyListings(listings?.slice(0, 3) || [])

            // 2. Wishlist Count
            const { count: wishlistCount } = await supabase
                .from('wishlist')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)

            // 3. Recommended Feed (Latest items not by me)
            const { data: feed } = await supabase
                .from('listings')
                .select(`
                    *,
                    users (name, avatar_url, trust_score, location)
                `)
                .neq('user_id', userId)
                .eq('status', 'available')
                .order('created_at', { ascending: false })
                .limit(6)

            setRecommended(feed || [])

            // 4. Unread Messages
            const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', userId)
                .eq('is_read', false)

            setStats({
                activeListings: activeCount,
                wishlistCount: wishlistCount || 0,
                unreadMessages: unreadCount || 0,
                totalViews
            })
            setLoading(false)
        }

        init()
    }, [router])

    if (loading) {
        return (
            <div className="container mx-auto max-w-7xl px-6 py-12 space-y-8">
                <div className="h-12 w-48 bg-muted rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="container mx-auto max-w-7xl px-6 pt-24 pb-12 space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground mb-2">
                            Welcome back, {user?.user_metadata?.name?.split(' ')[0] || 'Student'}!
                        </h1>
                        <p className="text-muted-foreground font-medium">Here's what's happening on campus today.</p>
                    </div>
                    <Link href="/sell">
                        <Button className="h-14 px-8 rounded-2xl font-black text-base shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                            <PlusCircle className="mr-2 h-5 w-5" /> List New Item
                        </Button>
                    </Link>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatsCard
                        icon={LayoutGrid}
                        label="Active Listings"
                        value={stats.activeListings}
                        color="text-blue-500"
                        bg="bg-blue-500/10"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        label="Total Views"
                        value={stats.totalViews}
                        color="text-green-500"
                        bg="bg-green-500/10"
                    />
                    <StatsCard
                        icon={Heart}
                        label="Wishlist Items"
                        value={stats.wishlistCount}
                        color="text-red-500"
                        bg="bg-red-500/10"
                    />
                    <StatsCard
                        icon={MessageSquare}
                        label="Messages"
                        value={stats.unreadMessages}
                        color="text-orange-500"
                        bg="bg-orange-500/10"
                    />
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-12">

                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black flex items-center gap-2">
                                <Zap className="h-6 w-6 text-amber-500 fill-amber-500" /> Fresh Campus Finds
                            </h2>
                            <Link href="/marketplace" className="text-sm font-bold text-primary hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {recommended.map(item => (
                                <ListingCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / My Listings */}
                    <div className="space-y-8">
                        <div className="bg-card border border-border/50 rounded-[2.5rem] p-6 shadow-xl shadow-black/5">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" /> Your Quick Actions
                            </h3>
                            <div className="space-y-4">
                                {myListings.length > 0 ? (
                                    myListings.map(item => (
                                        <div key={item.id} className="flex gap-4 items-center group cursor-pointer hover:bg-secondary/50 p-2 rounded-xl transition-colors">
                                            <div className="h-12 w-12 bg-muted rounded-lg overflow-hidden shrink-0">
                                                <img src={item.images?.[0]} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-bold truncate text-sm">{item.title}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {item.view_count || 0} views
                                                </div>
                                            </div>
                                            <div className={`h-2 w-2 rounded-full ${item.status === 'available' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No active listings.
                                    </div>
                                )}
                                <Link href="/sell" className="block mt-4">
                                    <Button variant="outline" className="w-full rounded-xl font-bold border-dashed">
                                        + Add Another Listing
                                    </Button>
                                </Link>
                                <Link href="/profile" className="block">
                                    <Button variant="ghost" className="w-full rounded-xl font-bold">
                                        Manage Inventory
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatsCard({ icon: Icon, label, value, color, bg }: any) {
    return (
        <Card className="border-none shadow-lg bg-card hover:translate-y-[-4px] transition-transform duration-300">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <div className="text-2xl font-black tracking-tight">{value}</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
            </CardContent>
        </Card>
    )
}
