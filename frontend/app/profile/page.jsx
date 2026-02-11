'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import { User, LogOut, Package, Star, Edit, Trash2 } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth');
                return;
            }
            setUser(user);

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // Fetch Listings
            const { data: listings } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setMyListings(listings || []);
            setLoading(false);
        };

        getData();
    }, []);

    const markAsSold = async (id) => {
        const { error } = await supabase
            .from('listings')
            .update({ status: 'sold' })
            .eq('id', id);

        if (!error) {
            setMyListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l));
        }
    };

    const deleteListing = async (id) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;

        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);

        if (!error) {
            setMyListings(prev => prev.filter(l => l.id !== id));
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Profile...</div>;

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Profile Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
                        <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-primary text-3xl font-bold mb-4">
                            {profile?.name?.[0] || user.email?.[0].toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{profile?.college}</p>

                        <div className="flex justify-center gap-1 text-yellow-500 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} className={i < Math.round(profile?.rating || 0) ? "fill-current" : "text-gray-300"} />
                            ))}
                            <span className="text-gray-500 text-xs ml-2">({profile?.rating || 0})</span>
                        </div>

                        <div className="space-y-2 text-left text-sm border-t pt-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Department</span>
                                <span className="font-medium">{profile?.department || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Year</span>
                                <span className="font-medium">{profile?.year || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span className="font-medium truncate max-w-[150px]">{user.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Content */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Package className="h-6 w-6" /> My Listings
                        </h2>
                        <Link href="/create-listing" className="btn btn-primary px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium">
                            + New Listing
                        </Link>
                    </div>

                    {myListings.length === 0 ? (
                        <div className="bg-muted/30 border border-dashed rounded-xl p-12 text-center text-muted-foreground">
                            <p>You haven't posted anything yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myListings.map(listing => (
                                <div key={listing.id} className="bg-card border rounded-xl p-4 flex gap-4 items-center hover:shadow-sm transition-shadow">
                                    <div className="h-20 w-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={listing.images?.[0]} className="h-full w-full object-cover" alt="Item" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold truncate pr-4">{listing.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold border ${listing.status === 'sold' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                {listing.status}
                                            </span>
                                        </div>
                                        <p className="text-primary font-bold">₹{listing.expected_price}</p>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                            <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{listing.demand_score} views</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {listing.status === 'available' && (
                                            <button
                                                onClick={() => markAsSold(listing.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg text-xs font-medium border border-green-200"
                                                title="Mark as Sold"
                                            >
                                                Mark Sold
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteListing(listing.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
