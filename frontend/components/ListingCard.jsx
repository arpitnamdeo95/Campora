import Link from 'next/link';
import { Clock, MapPin, Zap, Flame, Snowflake } from 'lucide-react';

export default function ListingCard({ listing }) {
    const {
        id,
        title,
        expected_price,
        condition,
        category,
        images,
        demand_score,
        created_at,
        users
    } = listing;

    const demandBadge = () => {
        if (demand_score > 10) return <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full"><Flame size={12} /> High Demand</span>;
        if (demand_score < 3) return <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full"><Snowflake size={12} /> Low Demand</span>;
        return <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full"><Zap size={12} /> Medium Demand</span>;
    };

    return (
        <Link href={`/listings/${id}`} className="group block h-full">
            <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col bg-card">
                {/* Image */}
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                        src={images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
                        alt={title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        {demandBadge()}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {condition}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                    </div>

                    <p className="text-xl font-bold text-primary mb-2">₹{expected_price}</p>

                    <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span className="truncate">{users?.college || 'Unknown College'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span>{category}</span>
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
