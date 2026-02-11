"use client"

import { motion } from "framer-motion"
import { Trophy, Star, Flame, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const leaderboardData = [
    {
        icon: Trophy,
        title: "Top Seller This Month",
        name: "Priya Sharma",
        avatar: "PS",
        trustScore: 98,
        itemsSold: 47,
        gradient: "from-yellow-500 to-orange-500",
        bgGradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
        icon: Star,
        title: "Highest Trust Score",
        name: "Rahul Verma",
        avatar: "RV",
        trustScore: 100,
        itemsSold: 32,
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
        icon: Flame,
        title: "Most Active User",
        name: "Ananya Patel",
        avatar: "AP",
        trustScore: 95,
        itemsSold: 89,
        gradient: "from-red-500 to-pink-500",
        bgGradient: "from-red-500/20 to-pink-500/20"
    }
]

export default function CampusLeaderboardSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-orange-950 via-amber-950 to-orange-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px]" />

            <div className="container mx-auto max-w-7xl px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent mb-4">
                        Campus Leaderboard
                    </h2>
                    <p className="text-xl text-orange-200/80 max-w-2xl mx-auto">
                        Compete, earn rewards, and build your reputation
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {leaderboardData.map((leader, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            whileHover={{ y: -8 }}
                            className="group relative"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${leader.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />

                            <div className="relative bg-gradient-to-br from-orange-950/90 to-amber-950/90 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-8 hover:border-orange-400/50 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`h-10 w-10 bg-gradient-to-br ${leader.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <leader.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-sm font-bold text-orange-200/80 uppercase tracking-wider">
                                        {leader.title}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="h-16 w-16 border-2 border-orange-400/50 shadow-lg">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${leader.name}`} />
                                        <AvatarFallback className={`bg-gradient-to-br ${leader.gradient} text-white font-black text-xl`}>
                                            {leader.avatar}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <h4 className="text-xl font-black text-orange-100 mb-1">
                                            {leader.name}
                                        </h4>
                                        <Badge className={`bg-gradient-to-r ${leader.gradient} text-white border-none shadow-lg`}>
                                            Trust Score: {leader.trustScore}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-orange-500/20">
                                    <div className="flex justify-between items-center">
                                        <span className="text-orange-300/80 text-sm">Items Sold</span>
                                        <span className="text-2xl font-black text-orange-100">{leader.itemsSold}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center"
                >
                    <Link href="/leaderboard">
                        <Button
                            size="lg"
                            className="h-14 px-10 text-lg font-black rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 hover:scale-105 transition-all duration-300 group"
                        >
                            View Full Leaderboard
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
