import { type NextRequest, NextResponse } from "next/server"
import { getOpenRouterResponse } from "@/lib/openrouter"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { chatId, messages } = await req.json()

    if (!chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Log API key status (without revealing the actual key)
    console.log("API_KEY exists:", !!process.env.API_KEY)

    // Get response from OpenRouter
    try {
      const aiResponse = await getOpenRouterResponse(messages)

      // Store the message in the database
      const supabase = createServerSupabaseClient()

      // Store user's last message
      const lastUserMessage = messages[messages.length - 1]
      await supabase.from("messages").insert({
        chat_id: chatId,
        role: lastUserMessage.role,
        content: lastUserMessage.content,
      })

      // Store AI response
      const { data: aiMessageData, error: aiMessageError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          role: aiResponse.role,
          content: aiResponse.content,
        })
        .select()
        .single()

      if (aiMessageError) {
        console.error("Error storing AI message:", aiMessageError)
        return NextResponse.json({ error: "Failed to store message" }, { status: 500 })
      }

      // Update chat's updated_at timestamp
      await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId)

      return NextResponse.json({
        message: {
          id: aiMessageData.id,
          role: aiResponse.role,
          content: aiResponse.content,
          created_at: aiMessageData.created_at,
        },
      })
    } catch (error: any) {
      // If there's an API key issue, provide a more helpful error message
      if (error.message && error.message.includes("401")) {
        return NextResponse.json(
          {
            error: "Authentication failed with OpenRouter. Please check your API_KEY environment variable.",
            message: {
              id: "fallback",
              role: "assistant",
              content:
                "I'm sorry, but there was an issue connecting to the AI service. Please check your API key configuration.",
              created_at: new Date().toISOString(),
            },
          },
          { status: 200 }, // Return 200 to allow the UI to display the fallback message
        )
      }
      throw error
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
