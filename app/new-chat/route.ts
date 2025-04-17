import { NextResponse } from "next/server"
import { createChat } from "../actions"
import { headers } from "next/headers"

export async function GET(request: Request) {
  try {
    // Create a new chat
    const chatId = await createChat()

    // Get the host from the request headers
    const headersList = headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"

    // Create the base URL
    const baseUrl = `${protocol}://${host}`

    // Redirect to the new chat
    return NextResponse.redirect(new URL(`/chat/${chatId}`, baseUrl))
  } catch (error) {
    console.error("Error creating new chat:", error)

    // Get the host from the request headers for the error redirect
    const headersList = headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"

    // Create the base URL
    const baseUrl = `${protocol}://${host}`

    return NextResponse.redirect(new URL("/", baseUrl))
  }
}
