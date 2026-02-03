"use client"

import { useState, useRef, useEffect } from "react"
import { Message, Chat } from "@/types"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area" // Assuming ScrollArea or using div
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
// import { format } from "date-fns" // Optional for message time

interface ChatWindowProps {
    chat: Chat | undefined // Metadata for header
    messages: Message[]
    loading: boolean
    onSendMessage: (text: string) => Promise<void>
}

export function ChatWindow({ chat, messages, loading, onSendMessage }: ChatWindowProps) {
    const { user } = useAuth()
    const [inputText, setInputText] = useState("")
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!inputText.trim()) return
        setSending(true)
        try {
            await onSendMessage(inputText)
            setInputText("")
        } catch (error) {
            console.error(error)
        } finally {
            setSending(false)
            // focus input?
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (!chat) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a conversation to start messaging
            </div>
        )
    }

    const otherId = chat.participants.find(p => p !== user?.uid) || "unknown"
    const otherUser = chat.participantData[otherId] || { displayName: "Chat" }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center p-4 border-b shadow-sm z-10">
                <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback>{otherUser.displayName[0]}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{otherUser.displayName}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                {loading ? (
                    <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user?.uid
                        return (
                            <div key={msg.messageId} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[75%] rounded-lg px-4 py-2 text-sm shadow-sm",
                                    isMe ? "bg-primary text-primary-foreground" : "bg-card border"
                                )}>
                                    <p>{msg.text}</p>
                                    {/* <span className="text-[10px] opacity-70 block text-right mt-1">
                        {format(new Date(msg.timestamp), "HH:mm")}
                    </span> */}
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                    <Input
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={sending}
                    />
                    <Button size="icon" onClick={handleSend} disabled={sending || !inputText.trim()}>
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
