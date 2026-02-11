import Link from 'next/link';
import { ArrowRight, BookOpen, Smartphone, Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative px-4 py-24 lg:py-32 bg-background overflow-hidden">
                <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#6366f1_100%)] opacity-20 transform rotate-180"></div>
                <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
                    <div className="space-y-4 max-w-3xl">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground font-semibold mb-2">
                            Beta: AI Price Suggestions Live 🚀
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
                            Buy & Sell Securely Within <span className="text-primary">Your Campus</span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            Exchange books, notes, electronics, and hostel essentials with verified students.
                            Fair pricing powered by our custom AI Engine.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 min-[400px]:flex-row">
                        <Link
                            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            href="/marketplace"
                        >
                            Browse Listings <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            href="/auth"
                        >
                            Start Selling
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container px-4 py-12 md:py-24 lg:py-32 space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why CampusKart?</h2>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        We solved the biggest problems of college marketplaces: Pricing & Trust.
                    </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow bg-card">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <Zap className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold">AI Fair Pricing</h3>
                        <p className="text-muted-foreground">
                            Unsure what to charge? Our AI validates your item's condition and market demand to suggest the fair price instantly.
                        </p>
                    </div>
                    {/* Feature 2 */}
                    <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow bg-card">
                        <div className="p-3 rounded-full bg-secondary/10 text-secondary">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold">Verified Students Only</h3>
                        <p className="text-muted-foreground">
                            No random strangers. Sign up with your college email (.edu / .ac.in) to ensure a safe community.
                        </p>
                    </div>
                    {/* Feature 3 */}
                    <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow bg-card">
                        <div className="p-3 rounded-full bg-accent/10 text-accent-foreground">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold">Academic Resources</h3>
                        <p className="text-muted-foreground">
                            Find specific notes, textbooks, and drafters from seniors who passed your exact courses.
                        </p>
                    </div>
                </div>
            </section>

            {/* Category Preview */}
            <section className="bg-muted/50 py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold tracking-tighter">Popular Categories</h2>
                        <Link href="/marketplace" className="text-primary hover:underline">View All &rarr;</Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Books', 'Electronics', 'Notes', 'Hostel Needs'].map((cat) => (
                            <Link key={cat} href={`/marketplace?category=${cat}`} className="group relative overflow-hidden rounded-lg border bg-background hover:shadow-lg transition-all">
                                <div className="p-6 flex flex-col items-center justify-center h-40">
                                    {cat === 'Books' && <BookOpen className="h-10 w-10 mb-2 text-primary" />}
                                    {cat === 'Electronics' && <Smartphone className="h-10 w-10 mb-2 text-secondary" />}
                                    <span className="font-semibold">{cat}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
