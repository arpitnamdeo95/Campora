'use client';

import { useState, useEffect } from 'react';
import ListingCard from '@/components/ListingCard';
import Navbar from '@/components/Navbar';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

export default function MarketplacePage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
    });

    const CATEGORIES = ['Books', 'Notes', 'Electronics', 'Furniture'];
    const SORTS = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'demand_desc', label: 'Demand: High First' },
    ];

    const fetchListings = async () => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
            if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
            if (filters.sort) queryParams.append('sort', filters.sort);

            // Prioritize backend API URL from env, fallback to localhost:5000
            const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';

            const res = await fetch(`${apiUrl}/listings?${queryParams.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch listings');

            const data = await res.json();
            setListings(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Could not load listings at this time.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [filters]); // Re-fetch on filter change

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container px-4 py-8 mx-auto">
                <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

                {/* Controls Layout */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">

                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search for books, items..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Filters Row (Responsive wrap) */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <select
                            className="px-4 py-3 rounded-lg border bg-input"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            className="px-4 py-3 rounded-lg border bg-input"
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-64 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-destructive bg-destructive/10 rounded-xl">
                        <p>{error}</p>
                        <button onClick={fetchListings} className="mt-4 underline">Try Again</button>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-xl">
                        <p className="text-lg text-muted-foreground">No listings found matching your criteria.</p>
                        <button
                            onClick={() => setFilters({ search: '', category: '', sort: 'newest' })}
                            className="mt-4 text-primary hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
