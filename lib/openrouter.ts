import type { Message } from "./types"

// Make sure we're using the correct environment variable
const API_KEY = process.env.API_KEY

export async function getOpenRouterResponse(messages: Message[]) {
  if (!API_KEY) {
    console.error("Missing OpenRouter API key in environment variables")
    throw new Error("API key not configured. Please add the API_KEY environment variable.")
  }

  console.log("Using API key:", API_KEY ? "API key exists" : "API key missing")

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://vercel.com",
        "X-Title": "Chat App",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-opus:beta",
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error response:", errorText)
      throw new Error(`OpenRouter API error: ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    throw error
  }
}
