"use client"

import { useEffect, useState } from "react"
import { Clock, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface ResponseTimeBadgeProps {
    sellerId: string
    className?: string
}

type ResponseLevel = "instant" | "fast" | "medium" | "slow"

interface ResponseData {
    level: ResponseLevel
    label: string
    icon: typeof Zap
    color: string
}

export default function ResponseTimeBadge({ sellerId, className = "" }: ResponseTimeBadgeProps) {
    const [responseData, setResponseData] = useState<ResponseData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchResponseTime() {
            try {
                // Call the database function to get average response time
                const { data, error } = await supabase
                    .rpc('get_seller_response_time', { p_seller_id: sellerId })

                if (error) throw error

                // Parse interval string (format: "HH:MM:SS" or similar)
                const responseTime = parseInterval(data)
                const responseInfo = getResponseLevel(responseTime)

                setResponseData(responseInfo)
            } catch (error) {
                console.error('Error fetching response time:', error)
                // Default to slow if error
                setResponseData({
                    level: "slow",
                    label: "Response time unknown",
                    icon: Clock,
                    color: "bg-gray-500/20 text-gray-300 border-gray-500/30"
                })
            } finally {
                setLoading(false)
            }
        }

        fetchResponseTime()
    }, [sellerId])

    if (loading) {
        return (
            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                Loading...
            </Badge>
        )
    }

    if (!responseData) return null

    const Icon = responseData.icon

    return (
        <Badge className={`${responseData.color} ${className} flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            {responseData.label}
        </Badge>
    )
}

// Helper function to parse PostgreSQL interval
function parseInterval(interval: string): number {
    if (!interval) return Infinity

    // Handle PostgreSQL interval format
    const parts = interval.toString().match(/(\d+):(\d+):(\d+)/)
    if (!parts) return Infinity

    const hours = parseInt(parts[1])
    const minutes = parseInt(parts[2])
    const seconds = parseInt(parts[3])

    return hours * 60 + minutes + seconds / 60 // Return total minutes
}

// Determine response level based on average time
function getResponseLevel(minutes: number): ResponseData {
    if (minutes < 5) {
        return {
            level: "instant",
            label: "⚡ Replies instantly",
            icon: Zap,
            color: "bg-green-500/20 text-green-300 border-green-500/30"
        }
    } else if (minutes < 30) {
        return {
            level: "fast",
            label: "⏱ Replies within 30 min",
            icon: Clock,
            color: "bg-green-500/20 text-green-300 border-green-500/30"
        }
    } else if (minutes < 120) {
        return {
            level: "medium",
            label: "🕒 Replies within 2 hours",
            icon: Clock,
            color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
        }
    } else {
        return {
            level: "slow",
            label: "Slow responder",
            icon: Clock,
            color: "bg-gray-500/20 text-gray-300 border-gray-500/30"
        }
    }
}
