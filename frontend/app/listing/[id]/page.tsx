"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    MessageCircle,
    Star,
    ShieldCheck,
    MapPin,
    Flame,
    AlertTriangle,
    Share2,
    Heart,
    ArrowLeft,
    Clock,
    Sparkles,
    Check,
    Zap,
    IndianRupee
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { TrustBadge } from "@/components/TrustBadge"
import { OfferModal } from "@/components/OfferModal"
import { BoostButton } from "@/components/BoostButton"
import { WishlistButton } from "@/components/WishlistButton"
import ViewCounter from "@/components/ViewCounter"
import PriceInsightPanel from "@/components/PriceInsightPanel"
import ResponseTimeBadge from "@/components/ResponseTimeBadge"

export default function ListingDetails() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [listing, setListing] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [activeImage, setActiveImage] = useState(0)
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
    const [offers, setOffers] = useState<any[]>([])

    const isOwner = currentUser?.id === listing?.user_id

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const item = await api.get(`/listings/${id}`)
                setListing(item)

                // Track recently viewed
                const recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]')
                const updated = [
                    { id: item.id, title: item.title, price: item.expected_price, image: item.images?.[0] },
                    ...recentlyViewed.filter((ov: any) => ov.id !== item.id)
                ].slice(0, 10)
                localStorage.setItem('recently_viewed', JSON.stringify(updated))

                const { data: { user } } = await supabase.auth.getUser()
                setCurrentUser(user)

                if (user?.id === item.user_id) {
                    const offerData = await api.get(`/offers/listing/${id}`)
                    setOffers(offerData)
                }
            } catch (error) {
                console.error("Failed to load listing", error)
            } finally {
                setLoading(false)
            }
        }
        fetchListing()
    }, [id])

    const handleOfferAction = async (offerId: string, status: string) => {
        try {
            await api.post(`/offers/${offerId}/respond`, { status })
            setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status } : o))
            toast({ title: `Offer ${status}`, description: `The buyer has been notified.` })
            if (status === 'accepted') setListing({ ...listing, status: 'sold' })
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" })
        }
    }

    const handleChat = async () => {
        if (!currentUser) {
            toast({ title: "Login Required", description: "Please login to chat with seller." })
            router.push('/login')
            return
        }
        router.push(`/chat?listing_id=${id}&seller_id=${listing.user_id}&ref=listing`)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoaderIcon className="h-10 w-10 animate-spin text-primary" />
                <p className="font-bold text-slate-400">Fetching listing details...</p>
            </div>
        </div>
    )

    if (!listing) return <div className="text-center py-48 text-2xl font-bold">Item not found.</div>

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Top Bar / Navigation */}
            {/* Top Bar / Navigation - adjusted top offset to clear navbar */}
            <div className="bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-[72px] z-40">
                <div className="container px-4 mx-auto max-w-7xl h-20 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.back()} className="rounded-2xl group text-xs font-black uppercase tracking-widest px-6 hover:bg-secondary/50">
                        <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl"><Share2 className="h-5 w-5" /></Button>
                        <WishlistButton listingId={id as string} />
                    </div>
                </div>
            </div>

            <div className="container px-4 mx-auto max-w-7xl pt-12">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Left: Visuals */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-[4/3] relative rounded-[3.5rem] overflow-hidden bg-secondary/30 shadow-2xl shadow-black/20 ring-1 ring-border/10"
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    src={listing.images?.[activeImage] || 'https://placehold.co/800x600/f1f5f9/64748b?text=Marketplace'}
                                    alt={listing.title}
                                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                                />
                            </AnimatePresence>
                            {listing.demand_score > 15 && (
                                <Badge className="absolute top-6 right-6 bg-orange-500 text-white px-4 py-2 rounded-full text-md animate-pulse">
                                    <Flame className="h-4 w-4 mr-1 fill-white" /> Trending listing
                                </Badge>
                            )}
                        </motion.div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none no-scrollbar justify-center">
                            {listing.images?.map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`h-24 w-24 rounded-3xl overflow-hidden border-4 transition-all ${activeImage === i ? 'border-primary ring-8 ring-primary/10 scale-105' : 'border-background hover:border-primary/30 opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} className="h-full w-full object-cover" alt="Detail" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
                                    {listing.category}
                                </Badge>
                                <span className="text-slate-300">•</span>
                                <div className="flex items-center text-muted-foreground text-xs font-bold gap-1 uppercase tracking-tighter">
                                    <Clock className="h-3 w-3" /> listed {new Date(listing.created_at).toLocaleDateString()}
                                </div>
                                <span className="text-slate-300">•</span>
                                <ViewCounter listingId={listing.id} initialCount={listing.view_count || 0} />
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9] text-foreground">
                                {listing.title}
                            </h1>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <MapPin className="h-5 w-5 text-primary" />
                                <span className="font-bold text-sm tracking-tight">{listing.users?.location || 'Verified Member'}</span>
                                <Badge variant="secondary" className="rounded-full bg-secondary/50 text-foreground font-black text-[10px] uppercase px-4 border-none">
                                    {listing.condition}
                                </Badge>
                                {listing.is_boosted && (
                                    <Badge className="bg-amber-500 text-white border-none rounded-full px-3 py-1 animate-pulse">
                                        <Zap className="h-3 w-3 mr-1 fill-white" /> Featured
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 lg:p-10 bg-card border border-border/50 rounded-[3.5rem] shadow-2xl shadow-black/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 text-primary opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles className="h-32 w-32" />
                            </div>
                            <div className="flex items-end gap-4">
                                <div>
                                    <div className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-widest">Current Price</div>
                                    <div className="text-5xl font-black text-primary">₹{listing.expected_price}</div>
                                </div>

                                {listing.ai_price && (
                                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-3">
                                        <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div className="text-xs leading-none">
                                            <div className="font-black mb-1">Fair Price Verified</div>
                                            <div className="font-medium opacity-80">Evaluated by AI Engine</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isOwner ? (
                                <BoostButton
                                    listingId={listing.id}
                                    isBoosted={listing.is_boosted}
                                    onUpdate={() => setListing({ ...listing, is_boosted: !listing.is_boosted })}
                                />
                            ) : (
                                <Button
                                    onClick={() => setIsOfferModalOpen(true)}
                                    className="h-16 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-200 transition-all hover:scale-105"
                                >
                                    Make an Offer
                                </Button>
                            )}
                        </div>

                        {/* Price Insights */}
                        <PriceInsightPanel
                            listingId={listing.id}
                            currentPrice={listing.expected_price}
                            category={listing.category}
                        />

                        {/* Seller Card */}
                        <div className="bg-slate-900 border text-white p-8 rounded-[2.5rem] shadow-2xl relative">
                            <div className="flex items-center gap-6 mb-8">
                                <Avatar className="h-20 w-20 border-4 border-white/10 ring-4 ring-primary/20">
                                    <AvatarImage src={listing.users?.avatar_url} />
                                    <AvatarFallback className="bg-primary text-2xl font-bold">{listing.users?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <div className="text-2xl font-black text-white">{listing.users?.name}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-amber-500 fill-amber-500">
                                            {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < (listing.users?.rating || 4) ? 'fill-amber-500' : 'fill-slate-700 text-slate-700'}`} />)}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 capitalize bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                            {listing.users?.rating?.toFixed(1) || '4.0'} Rating
                                        </span>
                                    </div>
                                    <div className="pt-1">
                                        <ResponseTimeBadge sellerId={listing.user_id} />
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mb-3">
                                        <Check className="h-3 w-3 text-emerald-500" /> Verified User Profile
                                    </div>
                                    <TrustBadge score={listing.users?.trust_score || 50} />
                                </div>
                            </div>

                            <Button size="lg" className="h-16 w-full rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 flex gap-3 shadow-xl shadow-primary/30 group" onClick={handleChat}>
                                <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" /> Chat with Seller
                            </Button>

                            <p className="mt-4 text-[10px] text-center text-slate-500 font-medium">
                                Meet up safely in public areas for transactions.
                            </p>
                        </div>

                        <div className="space-y-6 px-4">
                            <h3 className="text-xl font-bold border-b pb-4">Product Details</h3>
                            <div className="prose prose-slate leading-relaxed text-slate-600">
                                {listing.description || "The seller hasn't provided a detailed description for this item yet. Feel free to ask them in the chat!"}
                            </div>
                        </div>

                        {/* Offers Section (Seller Only) */}
                        {isOwner && offers.length > 0 && (
                            <div className="space-y-6 px-4 pt-8">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <IndianRupee className="h-5 w-5 text-primary" />
                                    Offers Received ({offers.length})
                                </h3>
                                <div className="space-y-3">
                                    {offers.map((offer) => (
                                        <div key={offer.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden">
                                                    {offer.buyer?.avatar_url && <img src={offer.buyer.avatar_url} className="h-full w-full object-cover" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold">{offer.buyer?.name}</div>
                                                    <div className="text-lg font-black text-primary">₹{offer.offer_price}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {offer.status === 'pending' ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold"
                                                            onClick={() => handleOfferAction(offer.id, 'accepted')}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl font-bold"
                                                            onClick={() => handleOfferAction(offer.id, 'rejected')}
                                                        >
                                                            Decline
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Badge className={`rounded-xl px-3 py-1 font-bold ${offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                        offer.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {offer.status.toUpperCase()}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Safety Banner */}
                <div className="mt-32 p-12 bg-orange-50 rounded-[3.5rem] border border-orange-100 flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-orange-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-orange-200">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-slate-900">Trading Safety Protocol</h4>
                            <p className="text-slate-600 max-w-md">Never send money before meeting. Only trade with verified users from our community.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-100 rounded-xl h-12 font-bold px-8">
                        Read Safety Guide
                    </Button>
                </div>
            </div>

            {listing && currentUser && (
                <OfferModal
                    isOpen={isOfferModalOpen}
                    onClose={() => setIsOfferModalOpen(false)}
                    listing={listing}
                    userId={currentUser.id}
                />
            )}
        </div>
    )
}

function LoaderIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
        </svg>
    )
}
