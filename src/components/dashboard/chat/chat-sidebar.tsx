"use client"

import { Chat } from "@/types"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface ChatSidebarProps {
    chats: Chat[]
    selectedChatId: string | null
    onSelectChat: (chatId: string) => void
}

export function ChatSidebar({ chats, selectedChatId, onSelectChat }: ChatSidebarProps) {
    const { user } = useAuth()

    if (!user) return null

    return (
        <div className="w-full border-r bg-muted/10 h-full overflow-y-auto">
            <div className="p-4 border-b">
                <h2 className="font-semibold">Messages</h2>
            </div>
            <div className="flex flex-col">
                {chats.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                        No conversations yet.
                    </div>
                )}
                {chats.map((chat) => {
                    // Identify other participant
                    const otherId = chat.participants.find(p => p !== user.uid) || "unknown"
                    const otherUser = chat.participantData[otherId] || { displayName: "Unknown User" }

                    return (
                        <button
                            key={chat.chatId}
                            onClick={() => onSelectChat(chat.chatId)}
                            className={cn(
                                "flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                                selectedChatId === chat.chatId && "bg-muted"
                            )}
                        >
                            <Avatar>
                                <AvatarImage src={otherUser.photoURL} />
                                <AvatarFallback>{otherUser.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium truncate">{otherUser.displayName}</span>
                                    {chat.lastMessage && (
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: false })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {chat.lastMessage?.text || "Started a conversation"}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
