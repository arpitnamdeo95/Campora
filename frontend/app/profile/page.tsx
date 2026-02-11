"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, LogOut, Package, Star, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { TrustBadge } from "@/components/TrustBadge"
import { BoostButton } from "@/components/BoostButton"
import { Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }
                setUser(user)

                // Parallel Fetch Profile + Listings
                const [profileData, listingsData] = await Promise.all([
                    api.get(`/profile/${user.id}`),
                    api.get(`/listings?user_id=${user.id}&sort=newest`) // Assuming API supports user_id filter or we filter client-side for MVP
                ])

                setProfile(profileData)
                setListings(listingsData)

            } catch (error) {
                console.error("Profile load error", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    if (loading) return <div className="h-96 flex items-center justify-center animate-pulse bg-muted rounded-xl m-8" />

    return (
        <div className="container py-12 max-w-5xl space-y-12 pt-32">

            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="overflow-hidden border border-border/50 shadow-2xl shadow-black/5 rounded-[3rem] bg-card">
                    <div className="h-40 bg-gradient-to-r from-primary via-indigo-600 to-violet-600 opacity-90" />
                    <CardContent className="relative pt-0 px-8 pb-10">
                        <div className="flex flex-col md:flex-row items-end md:items-center -mt-16 gap-8">
                            <Avatar className="h-32 w-32 border-8 border-card shadow-2xl rounded-[2.5rem]">
                                <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="text-3xl font-black bg-secondary">{profile?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3 mb-2">
                                <h1 className="text-4xl font-black tracking-tighter">{profile?.name || 'Verified Member'}</h1>
                                <p className="text-muted-foreground font-bold flex items-center gap-2 italic">
                                    {profile?.college || 'Local Area'} • {profile?.department || 'Community Member'}
                                </p>
                                <TrustBadge score={profile?.trust_score || 50} />
                            </div>
                            <div className="flex gap-3 mb-2">
                                <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-2 hover:bg-secondary/50"><User className="mr-2 h-4 w-4" /> Edit</Button>
                                <Button variant="destructive" size="icon" className="rounded-2xl h-12 w-12 shadow-lg shadow-destructive/20"><LogOut className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Star className="h-5 w-5 text-yellow-500" />}
                    label="Seller Rating"
                    value={profile?.rating?.toFixed(1) || '5.0'}
                    subtext="Based on 0 reviews"
                />
                <StatCard
                    icon={<Package className="h-5 w-5 text-blue-500" />}
                    label="Active Listings"
                    value={listings.filter(l => l.status === 'available').length}
                    subtext="Items for sale"
                />
                <StatCard
                    icon={<MessageSquare className="h-5 w-5 text-green-500" />}
                    label="Response Rate"
                    value="100%"
                    subtext="Usually replies in 1hr"
                />
            </div>

            {/* Listings Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tighter uppercase">Your Listings</h2>
                    <Button onClick={() => router.push('/sell')} className="rounded-2xl h-12 px-8 font-black bg-primary">Create New</Button>
                </div>

                {listings.length === 0 ? (
                    <div className="text-center py-20 border-4 border-dashed rounded-[3rem] bg-card/50 border-border/50">
                        <Package className="mx-auto h-16 w-16 text-muted-foreground/30 mb-6" />
                        <h3 className="text-2xl font-black mb-2">No active listings</h3>
                        <p className="text-muted-foreground font-medium mb-8">Start selling your old textbooks and gadgets today.</p>
                        <Button variant="outline" className="rounded-2xl h-14 px-10 border-2 font-black" onClick={() => router.push('/sell')}>Post an Item</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((item) => (
                            <Card key={item.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                                <div className="h-48 bg-muted relative">
                                    <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${item.status === 'available' ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                                        {item.status}
                                    </div>
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                                    <p className="text-sm font-bold text-primary">₹{item.expected_price}</p>
                                </CardHeader>
                                <CardContent className="p-5 pt-0 flex justify-between items-center">
                                    <span className="text-xs font-bold text-muted-foreground italic">{new Date(item.created_at).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                        {item.status === 'available' && (
                                            <BoostButton
                                                listingId={item.id}
                                                isBoosted={item.is_boosted}
                                                onUpdate={() => setListings(prev => prev.map(l => l.id === item.id ? { ...l, is_boosted: !l.is_boosted } : l))}
                                            />
                                        )}
                                        <Button variant="ghost" size="sm" className="h-10 rounded-xl px-4 font-black border-2 border-border/50 hover:bg-secondary">Manage</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, subtext }: any) {
    return (
        <Card className="rounded-[2.5rem] border border-border/50 bg-card shadow-xl shadow-black/5">
            <CardContent className="p-8 flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-secondary/50 flex items-center justify-center border-2 border-border/30">
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                    <h4 className="text-3xl font-black tracking-tight">{value}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground italic mt-1">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    )
}
