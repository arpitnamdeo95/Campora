"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, MoreVertical, Paperclip } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function ChatPage() {
    const [conversations, setConversations] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [activeChat, setActiveChat] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)

    const searchParams = useSearchParams()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { toast } = useToast()

    // Initialize
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return // Redirect handled by middleware ideally
            setCurrentUser(user)

            // Fetch existing conversations (Mock logic for MVP as schema is simple)
            // Real app needs a distinct conversations table or complex query
            // Here we actively find distinct sender/receiver pairs
            const { data } = await supabase
                .from('messages')
                .select('*, sender:sender_id(name, avatar_url), receiver:receiver_id(name, avatar_url)')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false })

            // Group by other user
            const uniqueChats = new Map()
            data?.forEach((msg: any) => {
                const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
                if (!uniqueChats.has(otherUserId)) {
                    uniqueChats.set(otherUserId, {
                        otherUser: msg.sender_id === user.id ? msg.receiver : msg.sender,
                        lastMessage: msg,
                        id: otherUserId // treating user ID as chat ID for simple 1-1
                    })
                }
            })
            setConversations(Array.from(uniqueChats.values()))
            setLoading(false)

            // Check URL params for new chat
            const sellerId = searchParams.get('seller_id')
            if (sellerId && sellerId !== user.id) {
                setActiveChat(sellerId)
            }
        }
        init()
    }, [])

    // Subscribe to Realtime Messages
    useEffect(() => {
        if (!activeChat || !currentUser) return

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${currentUser.id})`)
                .order('created_at', { ascending: true })
            setMessages(data || [])
            scrollToBottom()
        }
        fetchMessages()

        const channel = supabase
            .channel('chat_room')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    if (payload.new.sender_id === activeChat) {
                        setMessages((prev) => [...prev, payload.new])
                        scrollToBottom()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeChat, currentUser])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeChat || !currentUser) return

        try {
            const payload = {
                sender_id: currentUser.id,
                receiver_id: activeChat,
                content: newMessage,
                listing_id: searchParams.get('listing_id') || undefined // Optional context
            }

            // Optimistic update
            const tempId = Date.now()
            const optimisticMsg = { ...payload, id: tempId, created_at: new Date().toISOString() }
            setMessages((prev) => [...prev, optimisticMsg])
            setNewMessage("")
            scrollToBottom()

            // Actual send
            const { error } = await supabase.from('messages').insert([payload])
            if (error) throw error

        } catch (error) {
            console.error(error)
            toast({ title: "Failed to send", variant: "destructive" })
        }
    }

    return (
        <div className="container pt-24 pb-6 h-screen">
            <div className="grid md:grid-cols-[300px_1fr] h-full gap-6 rounded-2xl border bg-card overflow-hidden shadow-sm">

                {/* Sidebar */}
                <div className="border-r flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b font-semibold text-lg flex justify-between items-center">
                        Messages
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </div>
                    <ScrollArea className="flex-1">
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded skeleton" />)}
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">No messages yet.</div>
                        ) : (
                            <div className="flex flex-col">
                                {conversations.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setActiveChat(chat.id)}
                                        className={`flex items-start gap-3 p-4 text-left transition-colors hover:bg-slate-100 ${activeChat === chat.id ? 'bg-white border-l-4 border-primary shadow-sm' : ''}`}
                                    >
                                        <Avatar>
                                            <AvatarImage src={chat.otherUser?.avatar_url} />
                                            <AvatarFallback>{chat.otherUser?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-semibold text-sm truncate">{chat.otherUser?.name || 'User'}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(chat.lastMessage?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate font-medium">
                                                {chat.lastMessage?.sender_id === currentUser?.id ? 'You: ' : ''}{chat.lastMessage?.content}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                {activeChat ? (
                    <div className="flex flex-col h-full bg-slate-50/30">
                        {/* Header */}
                        <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={conversations.find(c => c.id === activeChat)?.otherUser?.avatar_url} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-sm">{conversations.find(c => c.id === activeChat)?.otherUser?.name || 'Chat'}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="h-2 w-2 bg-green-500 rounded-full inline-block" /> Online
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4 flex flex-col pb-4">
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender_id === currentUser?.id
                                    return (
                                        <motion.div
                                            key={msg.id || index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                                    : 'bg-white border rounded-bl-none'
                                                    }`}
                                            >
                                                <p>{msg.content}</p>
                                                <span className={`text-[10px] opacity-70 block text-right mt-1 ${isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 bg-white border-t">
                            <form onSubmit={sendMessage} className="flex gap-2 items-center">
                                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-50 border-0 focus-visible:ring-1"
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-10 w-10 text-slate-300" />
                        </div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function MessageCircle(props: any) {
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
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
    )
}
