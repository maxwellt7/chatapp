"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Chat, Message } from "@/lib/types"

// Create a new chat
export async function createChat(title = "New Chat"): Promise<string> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("chats").insert({ title }).select().single()

  if (error) {
    console.error("Error creating chat:", error)
    throw new Error("Failed to create chat")
  }

  // Only revalidate after the database operation is complete
  // This ensures we're not calling revalidatePath during render
  revalidatePath("/")
  return data.id
}

// Get all chats
export async function getChats(): Promise<Chat[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("chats").select("*").order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching chats:", error)
    return []
  }

  return data
}

// Get a specific chat with its messages
export async function getChat(chatId: string): Promise<{ chat: Chat | null; messages: Message[] }> {
  const supabase = createServerSupabaseClient()

  // Get chat
  const { data: chat, error: chatError } = await supabase.from("chats").select("*").eq("id", chatId).single()

  if (chatError) {
    console.error("Error fetching chat:", chatError)
    return { chat: null, messages: [] }
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  if (messagesError) {
    console.error("Error fetching messages:", messagesError)
    return { chat, messages: [] }
  }

  return { chat, messages }
}

// Delete a chat
export async function deleteChat(chatId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("chats").delete().eq("id", chatId)

  if (error) {
    console.error("Error deleting chat:", error)
    return false
  }

  revalidatePath("/")
  return true
}

// Import chat history
export async function importChatHistory(chatHistory: {
  title?: string
  messages: { role: "user" | "assistant" | "system"; content: string }[]
}): Promise<string | null> {
  const supabase = createServerSupabaseClient()

  // Generate a title if none provided
  const chatTitle = chatHistory.title || `Imported Chat ${new Date().toLocaleString()}`

  // Create a new chat
  const { data: chat, error: chatError } = await supabase.from("chats").insert({ title: chatTitle }).select().single()

  if (chatError) {
    console.error("Error creating chat for import:", chatError)
    return null
  }

  // Insert all messages
  const messagesToInsert = chatHistory.messages.map((msg) => ({
    chat_id: chat.id,
    role: msg.role,
    content: msg.content,
  }))

  if (messagesToInsert.length > 0) {
    const { error: messagesError } = await supabase.from("messages").insert(messagesToInsert)

    if (messagesError) {
      console.error("Error importing messages:", messagesError)
      // Delete the chat if message import fails
      await supabase.from("chats").delete().eq("id", chat.id)
      return null
    }
  }

  revalidatePath("/")
  return chat.id
}
