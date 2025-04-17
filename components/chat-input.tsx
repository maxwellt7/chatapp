"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { SendIcon } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!message.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSendMessage(message)
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled || isSubmitting}
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" disabled={disabled || isSubmitting || !message.trim()}>
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
