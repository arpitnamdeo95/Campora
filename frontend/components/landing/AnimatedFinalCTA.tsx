"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AnimatedFinalCTA() {
    return (
        <section className="py-32 bg-gradient-to-b from-orange-900 to-black relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/30 via-purple-500/20 to-transparent animate-pulse" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />

            {/* Floating orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
            />

            <div className="container mx-auto max-w-7xl px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {/* Main CTA Card */}
                    <div className="relative bg-gradient-to-br from-orange-600 via-purple-600 to-orange-700 rounded-[4rem] p-16 md:p-24 overflow-hidden shadow-2xl">
                        {/* Glow overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/30 to-purple-400/30" />
                        <motion.div
                            animate={{
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(251,146,60,0.4),transparent_70%)]"
                        />

                        {/* Content */}
                        <div className="relative z-10 text-center space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6">
                                    <Sparkles className="h-5 w-5 text-yellow-300" />
                                    <span className="text-white font-bold text-sm uppercase tracking-wider">Limited Time Offer</span>
                                </div>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-none drop-shadow-[0_0_60px_rgba(255,255,255,0.5)]"
                            >
                                Ready to Sell Smarter?
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto font-medium"
                            >
                                Join your campus marketplace today.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
                            >
                                <Link href="/register">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            size="lg"
                                            className="h-20 px-16 text-2xl font-black rounded-3xl bg-white text-orange-900 hover:bg-orange-50 shadow-2xl shadow-white/30 hover:shadow-white/50 transition-all duration-300 group relative overflow-hidden"
                                        >
                                            <motion.div
                                                animate={{
                                                    opacity: [0, 1, 0],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            />
                                            <span className="relative">Start Selling</span>
                                            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform relative" />
                                        </Button>
                                    </motion.div>
                                </Link>

                                <Link href="/marketplace">
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="h-20 px-12 text-2xl font-black rounded-3xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
                                    >
                                        Browse Items
                                    </Button>
                                </Link>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="text-white/70 text-sm pt-4"
                            >
                                🔒 Secure • ⚡ Instant • 🎯 Verified Students Only
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
