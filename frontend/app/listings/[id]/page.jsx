'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { MapPin, User, MessageCircle, Star, Clock, AlertTriangle } from 'lucide-react';

export default function ListingDetails({ params }) {
    const router = useRouter();
    const { id } = params;
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                // Fetch listing
                const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';
                const res = await fetch(`${apiUrl}/listings/${id}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                setListing(data);

                // Get current user for auth check
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchListing();
    }, [id]);

    const handleChat = async () => {
        if (!currentUser) {
            router.push('/auth');
            return;
        }
        if (currentUser.id === listing.user_id) {
            alert("You cannot chat with yourself!");
            return;
        }
        // Navigate to chat with context
        router.push(`/chat?listing_id=${listing.id}&receiver_id=${listing.user_id}`);
    };

    if (loading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>;
    if (!listing) return <div className="p-8 text-center text-red-500">Listing not found.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Images */}
                <div className="space-y-4">
                    <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden border">
                        <img
                            src={listing.images?.[0] || 'https://placehold.co/600x400?text=No+Image'}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Thumbnail Grid - MVP: just list */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {listing.images?.slice(1).map((img, i) => (
                            <div key={i} className="h-20 w-20 flex-shrink-0 bg-muted rounded-lg overflow-hidden border cursor-pointer hover:border-primary">
                                <img src={img} className="w-full h-full object-cover" alt="Thumb" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${listing.status === 'sold' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                {listing.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                            <span className="flex items-center gap-1"><Clock size={14} /> Posted {new Date(listing.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {listing.users?.college || 'Campus'}</span>
                        </div>
                        <p className="text-4xl font-bold text-primary">₹{listing.expected_price}</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {listing.description || "No description provided."}
                        </p>
                        <div className="mt-4 flex gap-2">
                            <span className="bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                                {listing.condition}
                            </span>
                            <span className="bg-muted px-3 py-1 rounded-full text-sm font-medium">
                                {listing.category}
                            </span>
                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className="bg-card border rounded-xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold">
                                {listing.users?.name?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="font-semibold">{listing.users?.name || 'Unknown User'}</p>
                                <div className="flex items-center gap-1 text-sm text-yellow-500">
                                    <Star size={14} className="fill-current" />
                                    <span>{listing.users?.rating?.toFixed(1) || 'New Seller'}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleChat}
                            disabled={listing.status !== 'available'}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                        >
                            <MessageCircle size={18} />
                            Chat Now
                        </button>
                    </div>

                    {listing.ai_price && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">AI Verified Pricing</p>
                                <p>This item is priced within the recommended {listing.condition} range.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
