"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { TrendingUp, Wallet } from "lucide-react"

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (!isInView) return

        let startTime: number | null = null
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)

            setCount(Math.floor(progress * value))

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [isInView, value, duration])

    return <span ref={ref}>{count.toLocaleString('en-IN')}</span>
}

export default function SellerEarningsSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-orange-950 via-black to-orange-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-grid-white/[0.02]" />

            <div className="container mx-auto max-w-7xl px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent mb-6 drop-shadow-[0_0_40px_rgba(251,146,60,0.6)]">
                        Students Are Saving & Earning Smarter
                    </h2>
                    <p className="text-xl text-orange-200/80 max-w-3xl mx-auto">
                        Real impact on real students. Join thousands making their money work harder.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-10 shadow-2xl border border-green-400/30 overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-green-100 font-bold text-sm uppercase tracking-wider">Total Savings</span>
                                </div>

                                <div className="text-6xl md:text-7xl font-black text-white mb-3 tracking-tighter">
                                    ₹<AnimatedCounter value={320000} />+
                                </div>

                                <p className="text-green-100/90 text-lg leading-relaxed">
                                    Students saved money by buying used instead of new.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative bg-gradient-to-br from-orange-600 to-amber-700 rounded-3xl p-10 shadow-2xl border border-orange-400/30 overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Wallet className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-orange-100 font-bold text-sm uppercase tracking-wider">Top Earner</span>
                                </div>

                                <div className="text-6xl md:text-7xl font-black text-white mb-3 tracking-tighter">
                                    ₹<AnimatedCounter value={12500} />
                                </div>

                                <p className="text-orange-100/90 text-lg leading-relaxed">
                                    Top seller earned this semester.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
