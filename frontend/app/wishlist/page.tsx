"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ShoppingBag, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { WishlistButton } from "@/components/WishlistButton"

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            try {
                const data = await api.get(`/wishlist?user_id=${user.id}`)
                setWishlist(data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            <div className="container px-4 mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-3">
                        <Link href="/marketplace" className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
                            <ArrowLeft className="h-4 w-4" /> Marketplace
                        </Link>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter">Wishlist.</h1>
                        <p className="text-muted-foreground font-bold italic">Items you've saved for later.</p>
                    </div>
                    <div className="h-20 w-20 bg-card rounded-[2rem] shadow-2xl flex items-center justify-center border border-border/50">
                        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 rounded-[2.5rem] bg-card border border-border/50 animate-pulse" />
                        ))}
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-card rounded-[4rem] border border-dashed border-border/50">
                        <div className="h-24 w-24 bg-secondary rounded-full flex items-center justify-center shadow-inner">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black">Your wishlist is empty</h3>
                            <p className="text-muted-foreground max-w-xs font-medium">Start saving items you're interested in while browsing the marketplace.</p>
                        </div>
                        <Link href="/marketplace">
                            <Button className="rounded-2xl h-16 px-10 font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                <Search className="mr-3 h-5 w-5" /> Browse Items
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {wishlist.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative"
                                >
                                    <Link href={`/listing/${item.listings.id}`} className="block">
                                        <div className="bg-card rounded-[2.5rem] overflow-hidden border border-border/50 shadow-xl shadow-black/5 hover:shadow-primary/10 transition-all duration-500">
                                            <div className="aspect-square relative overflow-hidden bg-secondary/30">
                                                <img
                                                    src={item.listings.images?.[0]}
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute top-5 right-5 z-10">
                                                    <WishlistButton listingId={item.listings.id} />
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-3">
                                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.listings.category}</div>
                                                <div className="text-lg font-black line-clamp-1 tracking-tight">{item.listings.title}</div>
                                                <div className="text-2xl font-black text-primary tracking-tighter mt-2">₹{item.listings.expected_price}</div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
