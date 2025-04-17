import { getChat } from "@/app/actions"
import { ChatContainer } from "./chat-container"
import { notFound } from "next/navigation"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chat, messages } = await getChat(params.id)

  if (!chat) {
    notFound()
  }

  return <ChatContainer chatId={params.id} initialMessages={messages} chatTitle={chat.title} />
}
