'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { Loader2, DollarSign, Camera, Tag, BrainCircuit } from 'lucide-react';

export default function CreateListing() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [priceSuggestion, setPriceSuggestion] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Books',
        condition: 'Used',
        expected_price: '',
        images: [] // Array of File objects or URLs
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        // For MVP, limiting to 3 images, simple client-side logic
        // In production, we'd upload immediately or show previews. 
        // Let's simplified: we'll upload on submit.
        setFormData(prev => ({ ...prev, images: files }));
    };

    const getAiPrice = async () => {
        if (!formData.title || !formData.category) {
            alert("Please enter a title and category first.");
            return;
        }
        setAiLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiUrl}/listings/suggest-price`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    condition: formData.condition,
                    expected_price: formData.expected_price
                })
            });
            const data = await res.json();
            setPriceSuggestion(data);
        } catch (e) {
            console.error("AI Price Error", e);
            alert("Could not fetch AI price.");
        } finally {
            setAiLoading(false);
        }
    };

    const applyPrice = (price) => {
        setFormData(prev => ({ ...prev, expected_price: price }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Get User
            // Need to be logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth');
                return;
            }

            // 2. Upload Images
            const uploadedImageUrls = [];
            for (const file of formData.images) {
                const fileName = `${user.id}/${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage
                    .from('listings')
                    .upload(fileName, file);

                if (error) throw error;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(fileName);
                uploadedImageUrls.push(publicUrl);
            }

            // 3. Create Listing via Backend (to secure logic and AI price confirmation)
            // Or directly via Supabase if easier. Backend is better for consistency.
            const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiUrl}/listings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    user_id: user.id,
                    images: uploadedImageUrls,
                    // AI price is re-verified in backend usually, but for MVP we send it
                    // Actually backend recalculates/stores it.
                })
            });

            if (!res.ok) throw new Error('Failed to create listing');

            const data = await res.json();
            router.push(`/listings/${data.id}`);

        } catch (e) {
            console.error(e);
            alert('Error creating listing: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Sell an Item</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Item Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="w-full px-4 py-3 rounded-lg border bg-input outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g. Engineering Mathematics - 3rd Edition"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    name="category"
                                    className="w-full px-4 py-3 rounded-lg border bg-input outline-none focus:ring-2 focus:ring-primary"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option>Books</option>
                                    <option>Notes</option>
                                    <option>Electronics</option>
                                    <option>Furniture</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Condition</label>
                                <select
                                    name="condition"
                                    className="w-full px-4 py-3 rounded-lg border bg-input outline-none focus:ring-2 focus:ring-primary"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                >
                                    <option>Used</option>
                                    <option>Like New</option>
                                    <option>New</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border bg-input outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Provide details about the item..."
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Photos</label>
                            <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:bg-muted/50 transition-colors relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                    <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Click to upload photos</p>
                                    {formData.images.length > 0 && (
                                        <p className="mt-2 text-xs text-primary font-medium">{formData.images.length} files selected</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Price (₹)</label>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        name="expected_price"
                                        required
                                        className="w-full pl-9 pr-4 py-3 rounded-lg border bg-input outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="0.00"
                                        value={formData.expected_price}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={getAiPrice}
                                    disabled={aiLoading}
                                    className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 flex items-center gap-2"
                                >
                                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                                    AI Suggest
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 shadow-lg glow"
                            >
                                {loading ? 'Posting Listing...' : 'Post Listing'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* AI Sidebar */}
                <div className="md:col-span-1">
                    {priceSuggestion ? (
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-card border rounded-xl p-6 shadow-sm">
                                <h3 className="font-semibold flex items-center gap-2 mb-4">
                                    <BrainCircuit className="h-5 w-5 text-primary" />
                                    AI Price Analysis
                                </h3>

                                <div className="space-y-3">
                                    {/* Recommended */}
                                    <div
                                        onClick={() => applyPrice(priceSuggestion.recommended)}
                                        className="p-3 border rounded-lg bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors"
                                    >
                                        <div className="text-xs text-muted-foreground font-medium uppercase">Recommended</div>
                                        <div className="text-2xl font-bold text-primary">₹{priceSuggestion.recommended}</div>
                                        <div className="text-xs text-muted-foreground mt-1">Fair market value</div>
                                    </div>

                                    {/* Quick Sale */}
                                    <div
                                        onClick={() => applyPrice(priceSuggestion.quick_sale)}
                                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    >
                                        <div className="text-xs text-muted-foreground font-medium uppercase">Quick Sale</div>
                                        <div className="text-xl font-bold text-green-600">₹{priceSuggestion.quick_sale}</div>
                                        <div className="text-xs text-muted-foreground mt-1">Sell 2x faster</div>
                                    </div>

                                    {/* Max Value */}
                                    <div
                                        onClick={() => applyPrice(priceSuggestion.max_value)}
                                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    >
                                        <div className="text-xs text-muted-foreground font-medium uppercase">Max Value</div>
                                        <div className="text-xl font-bold text-orange-600">₹{priceSuggestion.max_value}</div>
                                        <div className="text-xs text-muted-foreground mt-1">Wait for right buyer</div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
                                    <p>Based on {priceSuggestion.details?.market_data_points || 0} similar listings.</p>
                                    <p>Demand Level: <span className="font-semibold text-foreground">{priceSuggestion.details?.demand_score || 'Unknown'}</span></p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/30 rounded-xl p-6 text-center text-muted-foreground border border-dashed">
                            <BrainCircuit className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Enter details and click "AI Suggest" to get real-time pricing data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
