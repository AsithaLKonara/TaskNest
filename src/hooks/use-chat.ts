"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    setDoc,
    getDoc,
    updateDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Chat, Message } from "@/types"

export function useChat() {
    const { user } = useAuth()
    const [chats, setChats] = useState<Chat[]>([])
    const [loadingChats, setLoadingChats] = useState(true)
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

    const [messages, setMessages] = useState<Message[]>([])
    const [loadingMessages, setLoadingMessages] = useState(false)

    // Fetch active chats for the current user
    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid),
            orderBy("updatedAt", "desc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChats = snapshot.docs.map(doc => ({
                chatId: doc.id,
                ...doc.data()
            })) as Chat[]
            setChats(fetchedChats)
            setLoadingChats(false)
        })

        return () => unsubscribe()
    }, [user])

    // Fetch messages when a chat is selected
    useEffect(() => {
        if (!selectedChatId) {
            setMessages([])
            return
        }

        setLoadingMessages(true)
        const q = query(
            collection(db, "chats", selectedChatId, "messages"),
            orderBy("timestamp", "asc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                messageId: doc.id,
                ...doc.data()
            })) as Message[]
            setMessages(fetchedMessages)
            setLoadingMessages(false)
        })

        return () => unsubscribe()
    }, [selectedChatId])

    const sendMessage = async (chatId: string, text: string) => {
        if (!user || !text.trim()) return

        try {
            // 1. Add message to sub-collection
            const messageData = {
                chatId,
                senderId: user.uid,
                text: text.trim(),
                timestamp: Date.now(), // Use generic timestamp for sorting easily
            }

            await addDoc(collection(db, "chats", chatId, "messages"), messageData)

            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: {
                    text: text.trim(),
                    senderId: user.uid,
                    timestamp: Date.now()
                },
                updatedAt: Date.now()
            })

            // 3. Update lastActiveAt if sender is a freelancer
            // We can check the freelancerProfiles collection for this UID
            // For efficiency, we just try to update. If it fails (not a freelancer), it's fine.
            try {
                await updateDoc(doc(db, "freelancerProfiles", user.uid), {
                    lastActiveAt: Date.now()
                })
            } catch (e) { /* ignore if not a freelancer */ }

        } catch (error) {
            console.error("Error sending message:", error)
            throw error
        }
    }

    const startChat = async (recipientId: string, recipientName: string) => {
        if (!user) return null

        // Check if chat already exists
        // Note: In a real app we might query for existing chat with these exact 2 participants
        // For MVP, we'll try to find one in memory or just create new if not found in list logic easily
        // Better: Query Firestore.
        // Simplifying: Check local `chats` for a chat with this participant.

        const existingChat = chats.find(c => c.participants.includes(recipientId))
        if (existingChat) {
            setSelectedChatId(existingChat.chatId)
            return existingChat.chatId
        }

        // Create new chat
        const newChatData = {
            participants: [user.uid, recipientId],
            participantData: {
                [user.uid]: { displayName: user.displayName || "Me" },
                [recipientId]: { displayName: recipientName }
            },
            updatedAt: Date.now(),
            createdAt: serverTimestamp()
        }

        const docRef = await addDoc(collection(db, "chats"), newChatData)
        setSelectedChatId(docRef.id)
        return docRef.id
    }

    return {
        chats,
        loadingChats,
        messages,
        loadingMessages,
        selectedChatId,
        setSelectedChatId,
        sendMessage,
        startChat
    }
}
