import type { Message } from "@/lib/types"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-3/4 p-3 rounded-lg ${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.created_at && (
          <div className={`text-xs mt-1 ${isUser ? "text-blue-100" : "text-gray-500"}`}>
            {new Date(message.created_at).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
