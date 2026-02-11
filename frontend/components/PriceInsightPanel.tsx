"use client"

import { useEffect, useState } from "react"
import { TrendingDown, Eye, Zap, BarChart3 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

interface PriceInsightPanelProps {
    listingId: string
    currentPrice: number
    category: string
}

interface PriceInsights {
    average_price: number
    price_difference_percent: number
    similar_items_count: number
    views_this_week: number
}

export default function PriceInsightPanel({ listingId, currentPrice, category }: PriceInsightPanelProps) {
    const [insights, setInsights] = useState<PriceInsights | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchInsights() {
            try {
                // Call the database function to get price insights
                const { data, error } = await supabase
                    .rpc('get_price_insights', { p_listing_id: listingId })

                if (error) throw error

                if (data && data.length > 0) {
                    setInsights(data[0])
                }
            } catch (error) {
                console.error('Error fetching price insights:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchInsights()
    }, [listingId])

    if (loading) {
        return <PriceInsightSkeleton />
    }

    if (!insights || insights.similar_items_count < 3) {
        return null // Not enough data to show insights
    }

    const isCheaper = insights.price_difference_percent < 0
    const percentDiff = Math.abs(Math.round(insights.price_difference_percent))

    return (
        <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Market Insights
            </h3>

            <div className="grid grid-cols-1 gap-4">
                {/* Price Comparison */}
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isCheaper ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                        <TrendingDown className={`h-5 w-5 ${isCheaper ? '' : 'rotate-180'}`} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">
                            {isCheaper ? `${percentDiff}% cheaper` : `${percentDiff}% higher`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            than average {category} (₹{Math.round(insights.average_price)})
                        </p>
                    </div>
                </div>

                {/* Views */}
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Eye className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">
                            {insights.views_this_week} students
                        </p>
                        <p className="text-xs text-muted-foreground">
                            viewed this listing this week
                        </p>
                    </div>
                </div>

                {/* Prediction */}
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">
                            High Demand
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Likely to sell within {getLikelySellDays(insights.views_this_week)} days
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getLikelySellDays(weeklyViews: number): number {
    if (weeklyViews > 50) return 2
    if (weeklyViews > 20) return 5
    return 14
}

function PriceInsightSkeleton() {
    return (
        <div className="bg-card border rounded-xl p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-4">
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </div>
        </div>
    )
}
