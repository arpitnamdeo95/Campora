"use client"

import { motion } from "framer-motion"
import { Shield, CheckCircle, Handshake, Lock } from "lucide-react"

const trustFeatures = [
    {
        icon: Shield,
        title: "Trust Score",
        description: "Every seller has a dynamic trust score based on activity, ratings, and transaction history.",
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        icon: CheckCircle,
        title: "Verified Students",
        description: "Verified profiles build safer transactions within your campus community.",
        gradient: "from-green-500 to-emerald-500"
    },
    {
        icon: Handshake,
        title: "Smart Offers",
        description: "Negotiate smartly with counter offers and expiration protection.",
        gradient: "from-orange-500 to-amber-500"
    },
    {
        icon: Lock,
        title: "Secure Chat",
        description: "Private in-app messaging keeps your personal information safe.",
        gradient: "from-purple-500 to-pink-500"
    }
]

export default function TrustSystemSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-orange-900 via-amber-900 to-orange-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />

            <div className="container mx-auto max-w-7xl px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent mb-4">
                        Built on Trust & Security
                    </h2>
                    <p className="text-xl text-orange-200/80 max-w-2xl mx-auto">
                        Every transaction is protected by our comprehensive trust system
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trustFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                            <div className="relative bg-gradient-to-br from-orange-950/80 to-amber-950/80 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-8 h-full hover:border-orange-400/50 transition-all duration-300">
                                <div className={`h-14 w-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-xl font-black text-orange-100 mb-3">
                                    {feature.title}
                                </h3>

                                <p className="text-orange-300/80 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
