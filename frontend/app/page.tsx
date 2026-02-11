"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import RecentlySoldSection from "@/components/RecentlySoldSection"
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import {
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Zap,
    MessageSquare,
    TrendingUp,
    Star,
    CheckCircle2,
    Users,
    ShoppingCart,
    Flame,
    BrainCircuit,
    LayoutGrid,
    Globe,
    Rocket
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import AnimatedParticles from "@/components/AnimatedParticles"
import Hero from "@/components/ui/animated-shader-hero"
import TrustSystemSection from "@/components/landing/TrustSystemSection"
import SellerEarningsSection from "@/components/landing/SellerEarningsSection"
import CampusLeaderboardSection from "@/components/landing/CampusLeaderboardSection"
import AnimatedFinalCTA from "@/components/landing/AnimatedFinalCTA"

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })



    // Mouse Tracking for Cursor Glow
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth trailing effect
    const springX = useSpring(mouseX, { damping: 50, stiffness: 400 })
    const springY = useSpring(mouseY, { damping: 50, stiffness: 400 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [mouseX, mouseY])

    // Simplified Stats for Pre-launch
    const features = [
        { label: "Active Markets", value: "40+", icon: Globe },
        { label: "Verified Security", value: "100%", icon: ShieldCheck },
        { label: "Community Driven", value: "Open", icon: Users },
        { label: "AI Price Engine", value: "Beta", icon: BrainCircuit },
    ]

    return (
        <div ref={containerRef} className="relative w-full overflow-x-hidden pt-0">
            {/* --- ANIMATED SHADER HERO SECTION --- */}
            <Hero
                trustBadge={{
                    text: "Trusted by forward-thinking students.",
                    icons: [
                        <Rocket key="1" className="w-4 h-4" />,
                        <Sparkles key="2" className="w-4 h-4" />,
                        <Zap key="3" className="w-4 h-4" />
                    ]
                }}
                headline={{
                    line1: "CAMPORA",
                    line2: "Campus Marketplace"
                }}
                subtitle="Buy and sell safely in your community with AI-powered pricing, verified peer-to-peer security, and instant local connections."
                buttons={{
                    primary: {
                        text: "Browse Marketplace",
                        onClick: () => window.location.href = '/marketplace'
                    },
                    secondary: {
                        text: "Join Waitlist",
                        onClick: () => window.location.href = '/register'
                    }
                }}
            />


            {/* --- STATS SECTION (Edge-to-Edge) --- */}
            <section className="py-24 bg-gradient-to-b from-orange-950 via-amber-950 to-orange-900 border-y border-orange-500/20 relative overflow-hidden">
                {/* Ambient glow effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-amber-500/10 pointer-events-none" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="container px-6 mx-auto max-w-7xl relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {features.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative group text-center lg:text-left"
                            >
                                <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
                                <div className="relative">
                                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-2xl shadow-orange-500/50 border border-orange-400/50 mb-6 group-hover:scale-110 group-hover:shadow-orange-500/70 transition-all duration-300">
                                        <stat.icon className="h-7 w-7 text-white drop-shadow-lg" />
                                    </div>
                                    <div className="text-5xl font-black mb-2 tracking-tighter bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]">{stat.value}</div>
                                    <div className="text-orange-300/90 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- IMMERSIVE FEATURE HIGHLIGHTS --- */}
            <section className="py-32 relative bg-gradient-to-b from-orange-900 via-amber-900 to-orange-950 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[150px] pointer-events-none" />
                <div className="container px-6 mx-auto max-w-7xl relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                        <div className="max-w-2xl space-y-4">
                            <Badge className="bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-black px-4 py-2 uppercase backdrop-blur-sm shadow-lg shadow-orange-500/20">The Platform</Badge>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(251,146,60,0.6)]">Everything you need to <br /> dominate local trading.</h2>
                        </div>
                        <p className="max-w-xs text-orange-200/80 font-medium md:text-right">
                            Engineered for speed, built for security, and powered by intelligent market data.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "AI Price Evaluator",
                                desc: "No more lowballing. Our engine suggests prices based on real-time market activity and item history.",
                                icon: BrainCircuit,
                                color: "bg-blue-500"
                            },
                            {
                                title: "Verified Security",
                                desc: "Trade with confidence. Every user is verified via secure protocols within our community.",
                                icon: ShieldCheck,
                                color: "bg-emerald-500"
                            },
                            {
                                title: "Smart Demand Heatmap",
                                desc: "Identify high-velocity items instantly. Know what's hot and sell your old tech in hours.",
                                icon: Flame,
                                color: "bg-orange-500"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="group p-10 rounded-[3rem] bg-gradient-to-br from-orange-950/80 to-amber-950/80 backdrop-blur-xl border border-orange-500/30 hover:border-orange-400/50 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 relative overflow-hidden"
                            >
                                {/* Card glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className={`h-16 w-16 ${feature.color}/30 rounded-[1.5rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-${feature.color}/50 relative z-10`}>
                                    <div className={`h-10 w-10 ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <feature.icon className="h-6 w-6 drop-shadow-lg" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black mb-4 tracking-tighter text-orange-100 relative z-10">{feature.title}</h3>
                                <p className="text-orange-300/80 font-medium leading-relaxed relative z-10">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS (IMMERSIVE PROCESS) --- */}
            <section className="py-48 bg-gradient-to-br from-orange-900 via-amber-900 to-orange-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05]" />
                <div className="container px-6 mx-auto max-w-7xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-6xl font-black tracking-tighter leading-tight">The Peer-To-Peer <br /> Gold Standard.</h2>
                                <p className="text-xl text-orange-200 font-medium">Three simple steps to unlock the market value of your used essentials.</p>
                            </div>

                            <div className="space-y-12">
                                {[
                                    { step: "01", title: "Intelligent Listing", desc: "Snap photos, select condition. AI identifies what you're selling instantly." },
                                    { step: "02", title: "Market Valuation", desc: "Get an AI suggested price that ensures a fair and rapid sale." },
                                    { step: "03", title: "Instant Connect", desc: "Securely chat and meet the buyer locally for the final hand-off." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="text-6xl font-black text-white/10 group-hover:text-orange-400/60 transition-colors uppercase italic outline-text">{item.step}</div>
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-black tracking-tight">{item.title}</h4>
                                            <p className="text-orange-200 leading-relaxed font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="rounded-[4rem] bg-gradient-to-br from-orange-500 to-amber-500 p-1 overflow-hidden shadow-2xl">
                                <div className="rounded-[3.9rem] bg-gradient-to-br from-orange-950 to-amber-950 p-12 overflow-hidden relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                                        transition={{ duration: 10, repeat: Infinity }}
                                        className="h-96 w-full bg-gradient-to-br from-orange-900/50 to-amber-900/50 rounded-[2.5rem] flex items-center justify-center border border-orange-500/20 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-orange-500/20 blur-[80px]" />
                                        <div className="text-center space-y-4 relative z-10 p-8">
                                            <Sparkles className="h-16 w-16 text-orange-400 mx-auto mb-4 animate-pulse" />
                                            <h5 className="text-2xl font-black text-orange-100">AI Analysis Complete</h5>
                                            <p className="text-orange-200 text-sm italic font-medium px-4">"Item validated as 'Like New' condition. Recommended price ₹1,249 based on 12 local sales this week."</p>
                                        </div>
                                    </motion.div>

                                    <div className="mt-8 flex justify-center gap-4">
                                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                                        <div className="h-3 w-3 rounded-full bg-orange-500/20" />
                                        <div className="h-3 w-3 rounded-full bg-orange-500/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- NEW PREMIUM SECTIONS --- */}
            <TrustSystemSection />
            <RecentlySoldSection />
            <SellerEarningsSection />
            <CampusLeaderboardSection />
            <AnimatedFinalCTA />

            {/* --- FOOTER --- */}
            <footer className="py-20 border-t border-orange-500/20 bg-gradient-to-b from-black to-orange-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="container px-6 mx-auto max-w-7xl relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,146,60,0.5)]">Campora</span>
                        </div>
                        <div className="flex gap-12 text-orange-300/80 font-bold text-sm">
                            <Link href="/marketplace" className="hover:text-orange-300 transition-colors hover:drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">Marketplace</Link>
                            <Link href="/sell" className="hover:text-orange-300 transition-colors hover:drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">Sell Item</Link>
                            <Link href="/chat" className="hover:text-orange-300 transition-colors hover:drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">Messages</Link>
                            <Link href="/profile" className="hover:text-orange-300 transition-colors hover:drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">Support</Link>
                        </div>
                        <div className="text-orange-400/60 text-xs font-medium uppercase tracking-[0.2em]">
                            © 2026 Campora Inc.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function Card(props: any) {
    return (
        <div {...props} className={`rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl ${props.className}`}>
            {props.children}
        </div>
    )
}
