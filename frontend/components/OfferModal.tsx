"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, IndianRupee, Sparkles, X } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { api } from "@/lib/api"
import { useToast } from "./ui/use-toast"

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: {
        id: string;
        title: string;
        expected_price: number;
        user_id: string;
    };
    userId: string;
}

export function OfferModal({ isOpen, onClose, listing, userId }: OfferModalProps) {
    const [offerPrice, setOfferPrice] = useState(String(listing.expected_price))
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async () => {
        if (!offerPrice || isNaN(Number(offerPrice))) return

        setLoading(true)
        try {
            await api.post('/offers', {
                listing_id: listing.id,
                buyer_id: userId,
                seller_id: listing.user_id,
                offer_price: Number(offerPrice)
            })
            toast({
                title: "Offer Sent!",
                description: `Your offer of ₹${offerPrice} has been sent to the seller.`,
            })
            onClose()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 border border-white/10"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                            <X className="h-5 w-5" />
                        </button>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">Make an Offer</h3>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                You're offering for <span className="text-slate-900 dark:text-white font-bold">{listing.title}</span>.
                                The seller's asking price is <span className="text-primary font-black">₹{listing.expected_price}</span>.
                            </p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₹</div>
                                    <Input
                                        type="number"
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        className="h-16 pl-10 text-2xl font-black rounded-2xl bg-slate-50 dark:bg-white/5 border-none ring-primary"
                                        placeholder="Enter your price"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {[0.8, 0.9, 0.95].map((pct) => (
                                        <button
                                            key={pct}
                                            onClick={() => setOfferPrice(String(Math.round(listing.expected_price * pct)))}
                                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-bold hover:bg-primary hover:text-white transition-all"
                                        >
                                            {Math.round(pct * 100)}% (₹{Math.round(listing.expected_price * pct)})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full h-16 rounded-2xl text-lg font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                            >
                                {loading ? "Sending..." : "Send Offer"}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                                Seller has 24 hours to respond to your offer.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
