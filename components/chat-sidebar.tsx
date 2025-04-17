"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import type { Chat } from "@/lib/types"
import { getChats, deleteChat } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { PlusIcon, TrashIcon, KeyIcon } from "lucide-react"

export function ChatSidebar() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function loadChats() {
      setIsLoading(true)
      const chatList = await getChats()
      setChats(chatList)
      setIsLoading(false)
    }

    loadChats()
  }, [])

  async function handleCreateChat() {
    // Navigate to the route handler that will create the chat
    router.push("/new-chat")
  }

  async function handleDeleteChat(chatId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId)
      // Refresh the chat list
      const chatList = await getChats()
      setChats(chatList)
    }
  }

  return (
    <div className="w-64 h-screen bg-gray-100 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Chats</h2>
        <Button onClick={handleCreateChat} size="sm" variant="outline">
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : chats.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No chats yet</div>
        ) : (
          <ul className="space-y-2">
            {chats.map((chat) => {
              const isActive = pathname === `/chat/${chat.id}`
              return (
                <li key={chat.id} className="group">
                  <Link
                    href={`/chat/${chat.id}`}
                    className={`flex items-center justify-between p-2 rounded ${
                      isActive ? "bg-gray-200" : "hover:bg-gray-200"
                    }`}
                  >
                    <span className="truncate">{chat.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-auto pt-4 space-y-2">
        <Link href="/api-key-setup">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <KeyIcon className="h-4 w-4" />
            <span>API Key Setup</span>
          </Button>
        </Link>
        <Link href="/import">
          <Button variant="outline" className="w-full">
            Import Chat History
          </Button>
        </Link>
      </div>
    </div>
  )
}
