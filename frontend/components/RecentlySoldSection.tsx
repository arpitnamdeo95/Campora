"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCheck, TrendingUp, UserCheck, Flame, CalendarClock, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Listing {
    id: string
    title: string
    sold_price: number | null
    expected_price: number
    sold_at: string | null
    condition: string
    seller_name: string
    seller_avatar: string
    seller_rating: number
}

export default function RecentlySoldSection() {
    const [soldListings, setSoldListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSoldListings() {
            try {
                // Fetch recently sold listings with seller data
                const { data, error } = await supabase
                    .from('listings')
                    .select('id, title, sold_price, expected_price, sold_at, condition, seller:user_id (name, avatar_url, rating)')
                    .eq('status', 'sold')
                    .order('updated_at', { ascending: false }) // Most recent sold
                    .limit(6)

                if (error) throw error

                // Transform data safely
                const formatted = (data || []).map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    sold_price: item.sold_price || item.expected_price,
                    expected_price: item.expected_price,
                    sold_at: item.sold_at || item.updated_at,
                    condition: item.condition,
                    seller_name: item.seller?.name || "Anonymous",
                    seller_avatar: item.seller?.avatar_url || "",
                    seller_rating: item.seller?.rating || 0
                }))

                setSoldListings(formatted)
            } catch (error) {
                console.error('Error fetching sold listings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSoldListings()
    }, [])

    if (loading) return <ListingGridSkeleton />
    if (soldListings.length === 0) return null

    return (
        <section className="py-20 bg-background relative border-t border-border/50">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 font-bold uppercase tracking-wider text-xs">
                            <CheckCheck className="h-4 w-4" />
                            Sold Recently
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                            See What's Selling Now
                        </h2>
                    </div>
                    <Link href="/marketplace?status=sold" className="hidden md:block text-muted-foreground hover:text-primary transition-colors font-medium">
                        View All Sold →
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {soldListings.map((listing, i) => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card border rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                        SOLD
                                    </Badge>
                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTimeAgo(listing.sold_at)}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                    {listing.title}
                                </h3>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-foreground">
                                        ₹{listing.sold_price?.toLocaleString()}
                                    </span>
                                    {listing.sold_price !== listing.expected_price && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            ₹{listing.expected_price.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-4 mt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 border">
                                            <AvatarImage src={listing.seller_avatar} />
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                {listing.seller_name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {listing.seller_name}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        <span className="text-xs font-bold text-foreground">
                                            {listing.seller_rating.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function formatTimeAgo(dateString: string | null) {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + "m ago"
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + "h ago"
    return Math.floor(diffInSeconds / 86400) + "d ago"
}

function ListingGridSkeleton() {
    return (
        <section className="py-20 border-t">
            <div className="container mx-auto px-6 max-w-7xl space-y-8">
                <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        </section>
    )
}
