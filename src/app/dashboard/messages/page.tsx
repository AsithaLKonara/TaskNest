"use client"

import { useChat } from "@/hooks/use-chat"
import { ChatSidebar } from "@/components/dashboard/chat/chat-sidebar"
import { ChatWindow } from "@/components/dashboard/chat/chat-window"
import { Loader2 } from "lucide-react"

export default function MessagesPage() {
    const {
        chats,
        loadingChats,
        messages,
        loadingMessages,
        selectedChatId,
        setSelectedChatId,
        sendMessage
    } = useChat()

    // Find selected chat object for header info
    const selectedChat = chats.find(c => c.chatId === selectedChatId)

    if (loadingChats) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] border rounded-xl overflow-hidden bg-background shadow-sm">
            {/* Sidebar - responsive width */}
            <div className={`${selectedChatId ? 'hidden md:block' : 'w-full'} md:w-80 border-r`}>
                <ChatSidebar
                    chats={chats}
                    selectedChatId={selectedChatId}
                    onSelectChat={setSelectedChatId}
                />
            </div>

            {/* Main Window */}
            <div className={`${!selectedChatId ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
                {selectedChatId ? (
                    <ChatWindow
                        chat={selectedChat}
                        messages={messages}
                        loading={loadingMessages}
                        onSendMessage={(text) => sendMessage(selectedChatId, text)}
                    />
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground bg-muted/5">
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    )
}
