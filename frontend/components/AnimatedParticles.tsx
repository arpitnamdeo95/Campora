"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Particle {
    id: number
    x: number
    y: number
    size: number
    duration: number
    delay: number
    color: string
}

const COLORS = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-cyan-400"
]

export default function AnimatedParticles({ count = 40 }: { count?: number }) {
    const [particles, setParticles] = useState<Particle[]>([])

    useEffect(() => {
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2, // 2px to 6px
            duration: Math.random() * 20 + 10, // 10s to 30s
            delay: Math.random() * 10,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
        }))
        setParticles(newParticles)
    }, [count])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute rounded-full opacity-20 dark:opacity-40 ${p.color}`}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: "2px",
                        height: `${p.size}px`,
                    }}
                    animate={{
                        y: [-20, 20, -20],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}
