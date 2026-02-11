"use client"

import Link from "next/link"
import { Flame, Zap, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardFooter } from "@/components/ui/card"
import { WishlistButton } from "@/components/WishlistButton"
import { TrustBadge } from "@/components/TrustBadge"

interface ListingCardProps {
    item: any
    variant?: 'default' | 'wide'
}

export function ListingCard({ item, variant = 'default' }: ListingCardProps) {
    const isTrending = item.demand_score > 15
    const isBoosted = item.is_boosted

    return (
        <Link href={`/listing/${item.id}`} className="block group">
            <Card className={`rounded-[2.5rem] overflow-hidden border-none shadow-xl shadow-black/5 bg-card group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 relative ${isBoosted ? 'ring-2 ring-amber-400/50 ring-offset-4 dark:ring-offset-slate-900' : ''}`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700 bg-[radial-gradient(circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),_hsl(var(--primary)/0.1)_0%,_transparent_70%)]"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = ((e.clientX - rect.left) / rect.width) * 100
                        const y = ((e.clientY - rect.top) / rect.height) * 100
                        e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                        e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                    }}
                />

                <div className={`relative ${variant === 'wide' ? 'aspect-[4/3]' : 'aspect-[5/4]'} bg-secondary/50 overflow-hidden`}>
                    <img
                        src={item.images?.[0] || 'https://placehold.co/600x400/f1f5f9/64748b?text=Marketplace'}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        alt={item.title}
                    />

                    <div className="absolute top-5 left-5 flex flex-col gap-2">
                        {isBoosted && (
                            <Badge className="bg-amber-500 text-white border-none rounded-full px-3 py-1 font-black text-[10px] uppercase shadow-lg shadow-amber-500/20">
                                <Zap className="h-3 w-3 mr-1 fill-white" /> Featured
                            </Badge>
                        )}
                        {isTrending && !isBoosted && (
                            <Badge className="bg-primary text-white border-none rounded-full px-3 py-1 font-black text-[10px] uppercase animate-pulse">
                                <Flame className="h-3 w-3 mr-1 fill-white" /> Trending
                            </Badge>
                        )}
                        <Badge variant="secondary" className="bg-card/80 backdrop-blur-md text-foreground border-none rounded-full px-3 py-1 font-black text-[10px] uppercase shadow-sm">
                            {item.condition}
                        </Badge>
                    </div>

                    <div className="absolute top-5 right-5 z-10 transition-transform group-hover:scale-110">
                        <WishlistButton listingId={item.id} />
                    </div>

                    <div className="absolute bottom-5 left-5 bg-card px-5 py-2.5 rounded-2xl shadow-xl border-t border-border/10 group-hover:translate-x-1 transition-transform">
                        <span className="text-xl font-black text-primary tracking-tighter">₹{item.expected_price}</span>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{item.category}</div>
                            <h3 className="text-lg font-black line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{item.title}</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <TrustBadge score={item.users?.trust_score || 50} size="sm" />
                    </div>

                    <CardFooter className="p-0 pt-4 flex items-center justify-between border-t border-border/30">
                        <div className="flex items-center gap-3 text-left">
                            <div className="h-10 w-10 rounded-xl bg-secondary overflow-hidden ring-1 ring-border/10 shadow-inner">
                                {item.users?.avatar_url && <img src={item.users.avatar_url} className="h-full w-full object-cover" alt={item.users.name} />}
                            </div>
                            <div className="text-[10px]">
                                <div className="font-black text-foreground uppercase tracking-wider line-clamp-1">{item.users?.name || 'Seller'}</div>
                                <div className="text-muted-foreground font-bold mt-0.5 italic">{item.users?.location || 'Verified Member'}</div>
                            </div>
                        </div>
                        <div className="h-10 w-10 bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                    </CardFooter>
                </div>
            </Card>
        </Link>
    )
}
