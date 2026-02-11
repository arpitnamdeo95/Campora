"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    User, Calendar, MapPin,
    Star, MessageCircle, Package,
    TrendingUp, CheckCircle2, AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import ResponseTimeBadge from "@/components/ResponseTimeBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams } from "next/navigation"

interface SellerProfile {
    id: string
    name: string
    avatar_url: string
    created_at: string
    rating: number
    trust_score: number
    is_verified_student: boolean
    college?: string
    bio?: string
}

interface Listing {
    id: string
    title: string
    status: 'available' | 'sold'
    category: string
    expected_price: number
    sold_price?: number
    created_at: string
    images: string[]
}

export default function SellerPortfolioPage() {
    const params = useParams()
    const sellerId = params.id as string

    const [profile, setProfile] = useState<SellerProfile | null>(null)
    const [listings, setListings] = useState<Listing[]>([])
    const [soldListings, setSoldListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSellerData() {
            if (!sellerId) return

            try {
                // Fetch profile
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, name, avatar_url, created_at, rating, is_verified_student, college, trust_score')
                    .eq('id', sellerId)
                    .single()

                if (userError) throw userError
                setProfile(userData)

                // Fetch Listings
                const { data: listingsData, error: listingsError } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('user_id', sellerId)
                    .order('created_at', { ascending: false })

                if (listingsError) throw listingsError

                setListings(listingsData.filter(l => l.status === 'available'))
                setSoldListings(listingsData.filter(l => l.status === 'sold'))

            } catch (error) {
                console.error('Error fetching seller data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSellerData()
    }, [sellerId])

    if (loading) return <SellerProfileSkeleton />
    if (!profile) return <div className="p-20 text-center">Seller not found</div>

    const totalSold = soldListings.length
    const totalListings = listings.length + totalSold
    const totalEarnings = soldListings.reduce((sum, item) => sum + (item.sold_price || item.expected_price), 0)

    return (
        <div className="container mx-auto max-w-5xl px-6 pt-24 pb-12 space-y-8">
            {/* Header Section */}
            <header className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-black border border-orange-200 dark:border-orange-800 rounded-3xl p-8 md:p-12 overflow-hidden">
                <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative group"
                    >
                        <Avatar className="h-32 w-32 border-4 border-white dark:border-black shadow-2xl">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback className="text-4xl bg-orange-100 text-orange-600 font-bold">
                                {profile.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        {profile.is_verified_student && (
                            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg" title="Verified Student">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        )}
                    </motion.div>

                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 flex items-center justify-center md:justify-start gap-3">
                                {profile.name}
                                <Badge variant="outline" className="text-sm font-medium border-orange-200 bg-orange-50 text-orange-700">
                                    Trust Score: {profile.trust_score || 0}%
                                </Badge>
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {profile.college || "Campus User"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    Joined {new Date(profile.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <ResponseTimeBadge sellerId={profile.id} />
                            <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
                                <Star className="h-4 w-4 fill-current" />
                                {profile.rating?.toFixed(1) || "New"}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3 justify-center md:justify-start">
                            <Button className="rounded-xl shadow-lg shadow-orange-500/20">
                                Follow Seller
                            </Button>
                            <Button variant="outline" className="rounded-xl">
                                Share Profile
                            </Button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-orange-200 dark:border-orange-800 rounded-2xl p-6 min-w-[240px] shadow-sm">
                        <div className="grid grid-cols-1 gap-4 divide-y divide-orange-100 dark:divide-orange-900">
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Total Earned</span>
                                <span className="text-lg font-black text-green-600">₹{totalEarnings.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-medium text-muted-foreground">Items Sold</span>
                                <span className="text-lg font-bold text-foreground">{totalSold}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-medium text-muted-foreground">Active Listings</span>
                                <span className="text-lg font-bold text-foreground">{listings.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Tabs */}
            <Tabs defaultValue="active" className="space-y-8">
                <TabsList className="bg-transparent border-b w-full justify-start h-auto p-0 space-x-8 rounded-none">
                    <TabsTrigger value="active" className="text-lg font-bold pb-4 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none bg-transparent shadow-none px-0">
                        Active Listings ({listings.length})
                    </TabsTrigger>
                    <TabsTrigger value="sold" className="text-lg font-bold pb-4 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none bg-transparent shadow-none px-0">
                        Sold History ({soldListings.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-6">
                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map(item => (
                                <ListingCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState label="No active listings currently." />
                    )}
                </TabsContent>

                <TabsContent value="sold" className="space-y-6">
                    {soldListings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {soldListings.map(item => (
                                <ListingCard key={item.id} item={item} isSold />
                            ))}
                        </div>
                    ) : (
                        <EmptyState label="No sold items yet." />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ListingCard({ item, isSold = false }: { item: Listing, isSold?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 ${isSold ? 'opacity-80 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}
        >
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {item.images?.[0] ? (
                    <img
                        src={item.images[0]}
                        alt={item.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-50 dark:bg-orange-900/10">
                        <Package className="h-10 w-10 text-orange-200" />
                    </div>
                )}

                {isSold && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-green-500 text-white font-black px-4 py-2 rounded-lg transform -rotate-12 shadow-xl border-2 border-white">
                            SOLD OUT
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="text-xs font-semibold capitalize">
                        {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                    </span>
                </div>

                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                </h3>

                <div className="flex items-baseline gap-2 pt-2 border-t mt-3">
                    <span className="text-xl font-black">
                        ₹{(item.sold_price || item.expected_price).toLocaleString()}
                    </span>
                    {isSold && item.sold_price && item.sold_price < item.expected_price && (
                        <span className="text-sm text-muted-foreground line-through decoration-red-400">
                            ₹{item.expected_price.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
            <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">{label}</p>
        </div>
    )
}

function SellerProfileSkeleton() {
    return (
        <div className="container max-w-5xl py-12 space-y-8 animate-pulse">
            <div className="h-64 bg-muted rounded-3xl" />
            <div className="grid grid-cols-3 gap-6">
                <div className="h-64 bg-muted rounded-2xl" />
                <div className="h-64 bg-muted rounded-2xl" />
                <div className="h-64 bg-muted rounded-2xl" />
            </div>
        </div>
    )
}
