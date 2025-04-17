"use client"

import { useState } from "react"
import type { Message } from "@/lib/types"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"

interface ChatContainerProps {
  chatId: string
  initialMessages: Message[]
  chatTitle: string
}

export function ChatContainer({ chatId, initialMessages, chatTitle }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendMessage(content: string) {
    setIsLoading(true)
    setError(null)

    // Optimistically add user message to UI
    const userMessage: Message = {
      role: "user",
      content,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      // Send to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          messages: [...messages, userMessage],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      if (data.error) {
        setError(data.error)
      }

      // Add AI response to messages if it exists
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
      }
    } catch (error) {
      console.error("Error in chat:", error)
      setError("Failed to get response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">{chatTitle}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation by sending a message
          </div>
        ) : (
          messages.map((message, index) => <ChatMessage key={message.id || index} message={message} />)
        )}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg">
              <div className="animate-pulse">AI is thinking...</div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 text-red-800 p-3 rounded-lg max-w-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-2">Please check your API_KEY environment variable or try again later.</p>
            </div>
          </div>
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
