'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { Send, User, MessageSquare } from 'lucide-react';

export default function ChatPage() {
    const searchParams = useSearchParams();
    const listingId = searchParams.get('listing_id');
    const receiverId = searchParams.get('receiver_id');

    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(listingId && receiverId ? { listingId, receiverId } : null);
    const messagesEndRef = useRef(null);

    // 1. Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUser(user);
        };
        checkAuth();
    }, []);

    // 2. Fetch Conversations (Grouped by Listing + Partner)
    // MVP: Fetch all messages where I'm sender or receiver, then unique
    useEffect(() => {
        if (!currentUser) return;

        const fetchConversations = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                *,
                listing:listings(title),
                sender:users!sender_id(name),
                receiver:users!receiver_id(name)
            `)
                .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching chats:', error);
                return;
            }

            // Group by unique conversation key (listing_id + other_user_id)
            const convMap = new Map();
            data.forEach(msg => {
                const cleanListingId = msg.listing_id || 'unknown';
                const isSender = msg.sender_id === currentUser.id;
                const otherId = isSender ? msg.receiver_id : msg.sender_id;
                const otherName = isSender ? msg.receiver?.name : msg.sender?.name;

                const key = `${cleanListingId}-${otherId}`;
                if (!convMap.has(key)) {
                    convMap.set(key, {
                        listingId: msg.listing_id,
                        partnerId: otherId,
                        partnerName: otherName || 'User',
                        listingTitle: msg.listing?.title || 'Item',
                        lastMessage: msg.message,
                        timestamp: msg.created_at
                    });
                }
            });

            // If we came from a listing page and it's new (not in history), add generic placeholder
            if (activeChat && !convMap.has(`${activeChat.listingId}-${activeChat.receiverId}`)) {
                // We'll treat it as a "New Conversation" locally
            }

            setConversations(Array.from(convMap.values()));
        };

        fetchConversations();

        // Realtime subscription for list updates (simplified: just poll or ignore new heads for MVP)
        const channel = supabase.channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                // efficient partial update or refetch
                fetchConversations();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);

    }, [currentUser, activeChat]);

    // 3. Fetch Active Chat Messages
    useEffect(() => {
        if (!currentUser || !activeChat) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('listing_id', activeChat.listingId)
                .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
                // We also need to filter to only messages between me and THIS partner
                // Because listing chats might be public if not careful, but schema links sender/receiver.
                // Actually, if I chat with User A about Item X, and User B chats with User A about Item X,
                // the listing_id is same. So we MUST filter by partner.
                .or(`and(sender_id.eq.${activeChat.receiverId}),and(receiver_id.eq.${activeChat.receiverId})`)
                .order('created_at', { ascending: true });

            if (error) console.error(error);
            else setMessages(data || []);
        };

        fetchMessages();

        // Subscribe to new messages in THIS chat
        const channel = supabase.channel(`chat:${activeChat.listingId}-${activeChat.receiverId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `listing_id=eq.${activeChat.listingId}`
            }, payload => {
                const msg = payload.new;
                if (
                    (msg.sender_id === currentUser.id && msg.receiver_id === activeChat.receiverId) ||
                    (msg.sender_id === activeChat.receiverId && msg.receiver_id === currentUser.id)
                ) {
                    setMessages(prev => [...prev, msg]);
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [activeChat, currentUser]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const { error } = await supabase.from('messages').insert([
            {
                listing_id: activeChat.listingId,
                sender_id: currentUser.id,
                receiver_id: activeChat.receiverId,
                message: newMessage
            }
        ]);

        if (error) {
            alert('Failed to send');
        } else {
            setNewMessage('');
            // Optimistic UI update handled by subscription usually, but safety:
            // setMessages(prev => [...prev, { ...temp }])
        }
    };

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const selectChat = (c) => {
        setActiveChat({ listingId: c.listingId, receiverId: c.partnerId });
    };

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full border rounded-xl overflow-hidden bg-card shadow-sm">

                {/* Sidebar List */}
                <div className="md:col-span-1 border-r bg-muted/20 flex flex-col">
                    <div className="p-4 border-b font-semibold text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> Recent Chats
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <p className="p-4 text-muted-foreground text-sm">No chats yet.</p>
                        ) : (
                            conversations.map((c, i) => (
                                <div
                                    key={i}
                                    onClick={() => selectChat(c)}
                                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${activeChat?.listingId === c.listingId && activeChat?.receiverId === c.partnerId ? 'bg-primary/10' : ''
                                        }`}
                                >
                                    <div className="font-semibold text-sm truncate">{c.partnerName}</div>
                                    <div className="text-xs text-muted-foreground truncate mb-1">{c.listingTitle}</div>
                                    <div className="text-sm text-foreground/80 truncate">{c.lastMessage}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="md:col-span-2 flex flex-col bg-background">
                    {activeChat ? (
                        <>
                            <div className="p-4 border-b flex justify-between items-center bg-muted/10">
                                <span className="font-semibold">Chatting about Item</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                                                }`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 rounded-lg border bg-input px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
                            <MessageSquare className="h-12 w-12 opacity-20" />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
