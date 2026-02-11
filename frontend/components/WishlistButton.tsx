"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "./ui/button"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { useToast } from "./ui/use-toast"

interface WishlistButtonProps {
    listingId: string;
    showLabel?: boolean;
    className?: string;
}

export function WishlistButton({ listingId, showLabel = false, className }: WishlistButtonProps) {
    const [isSaved, setIsSaved] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('wishlists')
                .select('*')
                .eq('user_id', user.id)
                .eq('listing_id', listingId)
                .single()

            setIsSaved(!!data)
        }
        checkStatus()
    }, [listingId])

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast({ title: "Login Required", description: "Save items to your wishlist." })
            return
        }

        // Optimistic UI
        const prevState = isSaved
        setIsSaved(!prevState)

        try {
            await api.post('/wishlist', { user_id: user.id, listing_id: listingId })
            toast({
                title: !prevState ? "Added to Wishlist" : "Removed from Wishlist",
                description: !prevState ? "You'll be notified of price changes." : "Item removed.",
            })
        } catch (err) {
            setIsSaved(prevState) // Rollback
            toast({ title: "Error", description: "Failed to update wishlist." })
        }
    }

    return (
        <Button
            variant={isSaved ? "secondary" : "outline"}
            size={showLabel ? "default" : "icon"}
            onClick={toggle}
            className={`rounded-2xl transition-all duration-300 ${isSaved ? 'text-red-500 bg-red-50 hover:bg-red-100 border-red-100' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'} ${className}`}
        >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            {showLabel && <span className="ml-2 font-bold">{isSaved ? "Saved" : "Save Item"}</span>}
        </Button>
    )
}
