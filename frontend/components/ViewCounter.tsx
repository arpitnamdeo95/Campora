// remove uuid import
import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ViewCounterProps {
    listingId: string
    initialCount?: number
}

export default function ViewCounter({ listingId, initialCount = 0 }: ViewCounterProps) {
    const [viewCount, setViewCount] = useState(initialCount)
    const [tracking, setTracking] = useState(false)

    useEffect(() => {
        async function trackView() {
            if (tracking) return

            setTracking(true)
            try {
                // Get or create session ID stored in localStorage
                let sessionId = localStorage.getItem('campora_session_id')
                if (!sessionId) {
                    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                        sessionId = crypto.randomUUID()
                    } else {
                        // Fallback for older browsers
                        sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
                    }
                    localStorage.setItem('campora_session_id', sessionId)
                }

                // Get current user if any
                const { data: { user } } = await supabase.auth.getUser()

                // Call database function to increment view atomically
                const { error } = await supabase
                    .rpc('increment_view_count', {
                        p_listing_id: listingId,
                        p_user_id: user?.id || null, // Can be null for anonymous
                        p_session_id: sessionId
                    })

                if (error) throw error

                // Optimistic update if successful
                setViewCount(prev => prev + 1)
            } catch (error) {
                console.error('Error tracking view:', error)
            }
        }

        trackView()
    }, [listingId])

    return (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium" title="Unique views">
            <Eye className="h-3.5 w-3.5" />
            <span>{viewCount.toLocaleString()} views</span>
        </div>
    )
}
