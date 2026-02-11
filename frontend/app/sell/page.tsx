"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Check, ArrowRight, ArrowLeft, BrainCircuit, Monitor, Book, Armchair, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { supabase } from "@/lib/supabase"

const stepVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
}

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    category: z.enum(["Books", "Electronics", "Notes", "Furniture", "Other"]),
    condition: z.enum(["New", "Like New", "Used", "Damaged"]),
    description: z.string().optional(),
    expected_price: z.coerce.number().min(1, "Price must be at least 1"),
})

export default function SellPage() {
    const [step, setStep] = useState(1)
    const [aiAnalysis, setAiAnalysis] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<File[]>([])
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: "Books",
            condition: "Used",
            expected_price: 0
        }
    })

    // Watch fields for AI analysis
    const watchTitle = form.watch("title")
    const watchCategory = form.watch("category")
    const watchCondition = form.watch("condition")

    const handleNext = async () => {
        const isValid = await form.trigger(["title", "category"])
        if (isValid) setStep(step + 1)
    }

    const handleBack = () => setStep(step - 1)

    const fetchAiPrice = async () => {
        setLoading(true)
        try {
            const price = form.getValues("expected_price")
            const res = await api.post('/prices/suggest', {
                title: watchTitle,
                category: watchCategory,
                condition: watchCondition,
                expected_price: price || 0
            })
            setAiAnalysis(res)
        } catch (error) {
            toast({ title: "AI Error", description: "Could not fetch price suggestion.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast({ title: "Login Required", description: "Please login to sell items", variant: "destructive" })
                router.push('/login')
                return
            }

            // Upload images
            const imageUrls = []
            for (const file of images) {
                const path = `${user.id}/${Date.now()}-${file.name}`
                const { error } = await supabase.storage.from('listings').upload(path, file)
                if (error) throw error
                const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(path)
                imageUrls.push(publicUrl)
            }

            // Create Listing
            await api.post('/listings', {
                ...values,
                user_id: user.id,
                images: imageUrls
            })

            toast({ title: "Success!", description: "Listing posted successfully." })
            router.push('/marketplace')

        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to create listing.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl pt-24 pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Sell an Item</h1>
                <p className="text-muted-foreground">List your item in 3 simple steps.</p>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-secondary mt-4 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <Card>
                            <CardHeader>
                                <CardTitle>What are you selling?</CardTitle>
                                <CardDescription>Categorize your item correctly for better visibility.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input {...form.register("title")} placeholder="e.g. Calculus 3rd Edition" />
                                    {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {['Books', 'Electronics', 'Notes', 'Furniture'].map((cat) => (
                                        <div
                                            key={cat}
                                            onClick={() => form.setValue("category", cat as any)}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors ${watchCategory === cat ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                                        >
                                            {cat === 'Books' && <Book className="h-6 w-6" />}
                                            {cat === 'Electronics' && <Monitor className="h-6 w-6" />}
                                            {cat === 'Notes' && <FileText className="h-6 w-6" />}
                                            {cat === 'Furniture' && <Armchair className="h-6 w-6" />}
                                            <span className="text-sm font-medium">{cat}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleNext} className="w-full">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details & Condition</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Condition</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['New', 'Like New', 'Used', 'Damaged'].map((cond) => (
                                            <div
                                                key={cond}
                                                onClick={() => form.setValue("condition", cond as any)}
                                                className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition-colors ${watchCondition === cond ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
                                            >
                                                {cond}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        {...form.register("description")}
                                        rows={4}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe any defects, highlights, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Upload Photos</label>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setImages(Array.from(e.target.files || []))}
                                    />
                                    <p className="text-xs text-muted-foreground">{images.length} files selected</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                                <Button onClick={() => setStep(3)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing Strategy</CardTitle>
                                <CardDescription>Let AI help you find the sweet spot.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-medium">Expected Price (₹)</label>
                                        <Input
                                            type="number"
                                            {...form.register("expected_price")}
                                            className="text-lg font-bold"
                                        />
                                    </div>
                                    <Button onClick={fetchAiPrice} disabled={loading} type="button" variant="secondary">
                                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <BrainCircuit className="h-4 w-4 mr-2" />}
                                        AI Suggest
                                    </Button>
                                </div>

                                {aiAnalysis && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="bg-slate-50 border rounded-xl p-4 space-y-3"
                                    >
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                            <SparklesIcon className="text-yellow-500 h-4 w-4" /> AI Recommendation
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div
                                                className="p-2 bg-white border rounded-lg cursor-pointer hover:border-primary transition-colors"
                                                onClick={() => form.setValue("expected_price", aiAnalysis.quick_sale)}
                                            >
                                                <div className="text-xs text-muted-foreground">Quick Sale</div>
                                                <div className="font-bold text-green-600">₹{aiAnalysis.quick_sale}</div>
                                            </div>
                                            <div
                                                className="p-2 bg-primary/10 border border-primary rounded-lg cursor-pointer"
                                                onClick={() => form.setValue("expected_price", aiAnalysis.recommended)}
                                            >
                                                <div className="text-xs text-primary font-bold">Recommended</div>
                                                <div className="font-bold text-primary">₹{aiAnalysis.recommended}</div>
                                            </div>
                                            <div
                                                className="p-2 bg-white border rounded-lg cursor-pointer hover:border-primary transition-colors"
                                                onClick={() => form.setValue("expected_price", aiAnalysis.max_value)}
                                            >
                                                <div className="text-xs text-muted-foreground">Max Profit</div>
                                                <div className="font-bold text-orange-600">₹{aiAnalysis.max_value}</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">
                                            Based on {aiAnalysis.market_data?.similar_count || 0} similar items & {aiAnalysis.market_data?.demand_level} demand.
                                        </p>
                                    </motion.div>
                                )}

                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                                <Button onClick={form.handleSubmit(onSubmit)} disabled={loading} size="lg">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                                    Publish Listing
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function SparklesIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M9 3v4" />
            <path d="M7 5h4" />
        </svg>
    )
}
