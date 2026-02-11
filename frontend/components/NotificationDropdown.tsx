"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle2, DollarSign, MessageCircle, Package, Star, TrendingUp, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { api } from "@/lib/api"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

const ICONS: Record<string, any> = {
    offer_received: DollarSign,
    offer_accepted: CheckCircle2,
    offer_rejected: Package,
    offer_countered: TrendingUp,
    message_received: MessageCircle,
    price_drop: TrendingUp,
    listing_sold: Zap,
    boost_expired: Bell,
    trust_update: Star
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const data = await api.get(`/notifications/${user.id}`)
                setNotifications(data || [])
                setUnreadCount((data || []).filter((n: any) => !n.is_read).length)

                // Realtime Listener
                const channel = supabase
                    .channel('notifications')
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    }, (payload) => {
                        setNotifications(prev => [payload.new, ...prev])
                        setUnreadCount(prev => prev + 1)
                    })
                    .subscribe()

                return () => { channel.unsubscribe() }
            } catch (error) {
                console.error('Failed to load notifications:', error)
            }
        }
        load()
    }, [])

    const markRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`, {})
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (e) { console.error(e) }
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-11 w-11 rounded-2xl relative bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-primary text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/10 z-50 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                <h4 className="font-black text-sm uppercase tracking-widest">Alerts</h4>
                                <Badge variant="secondary" className="rounded-full text-[10px] font-black">{unreadCount} New</Badge>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center space-y-3">
                                        <div className="h-12 w-12 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                            <Bell className="h-6 w-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 italic">No new activity.</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const Icon = ICONS[n.type] || Bell;
                                        return (
                                            <button
                                                key={n.id}
                                                onClick={() => markRead(n.id)}
                                                className={`w-full p-4 flex gap-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group relative ${!n.is_read ? 'bg-primary/5' : ''}`}
                                            >
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${!n.is_read ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                                                        {n.type.replace('_', ' ')}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                        {new Date(n.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary absolute top-4 right-4" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-50 dark:border-white/5">
                                <Button className="w-full rounded-xl h-10 text-xs font-bold" variant="ghost">View All History</Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
