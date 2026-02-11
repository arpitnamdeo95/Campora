"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import { Button } from "./ui/button"
import { api } from "@/lib/api"
import { useToast } from "./ui/use-toast"

interface BoostButtonProps {
    listingId: string;
    isBoosted: boolean;
    onUpdate?: () => void;
}

export function BoostButton({ listingId, isBoosted, onUpdate }: BoostButtonProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleBoost = async () => {
        setLoading(true)
        try {
            if (isBoosted) {
                await api.delete(`/boost/${listingId}`)
                toast({ title: "Boost Removed", description: "Your listing is no longer featured." })
            } else {
                await api.post(`/boost/${listingId}`, {})
                toast({ title: "Listing Boosted! 🚀", description: "Your item is now appearing at the top of results." })
            }
            onUpdate?.()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant={isBoosted ? "secondary" : "outline"}
            className={`rounded-xl px-6 font-bold flex gap-2 transition-all ${isBoosted ? 'bg-amber-500 text-white hover:bg-amber-600 border-none animate-pulse shadow-lg shadow-amber-500/20' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}`}
            onClick={handleBoost}
            disabled={loading}
        >
            <Zap className={`h-4 w-4 ${isBoosted ? 'fill-current' : ''}`} />
            {loading ? "Processing..." : isBoosted ? "Boosted!" : "Boost Item"}
        </Button>
    )
}
