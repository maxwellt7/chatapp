import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getChats } from "./actions"

export default async function Home() {
  // Instead of creating a chat and redirecting, we'll show a welcome page
  // with options to create a new chat or view existing ones
  const chats = await getChats()
  const hasExistingChats = chats.length > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold">Welcome to Chat App</h1>
        <p className="text-gray-600">Chat with AI powered by OpenRouter and store your conversations</p>

        <div className="pt-6 space-y-4">
          <Link href="/new-chat">
            <Button className="w-full">Start a New Chat</Button>
          </Link>

          {hasExistingChats && (
            <Link href={`/chat/${chats[0].id}`}>
              <Button variant="outline" className="w-full">
                Continue Recent Chat
              </Button>
            </Link>
          )}

          <Link href="/import">
            <Button variant="outline" className="w-full">
              Import Chat History
            </Button>
          </Link>

          <Link href="/api-key-setup">
            <Button variant="outline" className="w-full">
              Setup API Key
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
