"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { importChatHistory } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/input"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jsonText, setJsonText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedFormat, setDetectedFormat] = useState<any>(null)
  const router = useRouter()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)

      // Try to read the file to show a preview
      try {
        const text = await selectedFile.text()
        setJsonText(text)
        const parsed = JSON.parse(text)
        setDetectedFormat(parsed)
      } catch (e) {
        console.error("Error parsing file:", e)
      }
    }
  }

  // Function to download a sample file
  function downloadSample() {
    const sampleData = {
      title: "Sample Chat",
      messages: [
        { role: "user", content: "Hello, how are you?" },
        { role: "assistant", content: "I'm doing well, thank you for asking! How can I help you today?" },
        { role: "user", content: "Can you tell me about the weather?" },
        {
          role: "assistant",
          content:
            "I don't have real-time weather data, but I'd be happy to discuss weather patterns or help you find a weather service!",
        },
      ],
    }

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-chat.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Update the handleImport function to be more flexible
  async function handleImport(source: "file" | "text") {
    let content: string

    if (source === "file") {
      if (!file) {
        setError("Please select a file to import")
        return
      }
      content = await file.text()
    } else {
      if (!jsonText.trim()) {
        setError("Please enter JSON data")
        return
      }
      content = jsonText
    }

    setIsLoading(true)
    setError(null)

    try {
      let chatHistory

      try {
        chatHistory = JSON.parse(content)
      } catch (e) {
        throw new Error("Invalid JSON format. Please ensure your data is valid JSON.")
      }

      console.log("Original structure:", JSON.stringify(chatHistory, null, 2))

      // Try to detect and adapt to different formats
      const adaptedChatHistory = adaptChatFormat(chatHistory)

      console.log("Adapted structure:", JSON.stringify(adaptedChatHistory, null, 2))

      // Import the chat history
      const chatId = await importChatHistory(adaptedChatHistory)

      if (!chatId) {
        throw new Error("Failed to import chat history")
      }

      // Redirect to the imported chat
      router.push(`/chat/${chatId}`)
    } catch (e) {
      console.error("Import error:", e)
      setError(e instanceof Error ? e.message : "Failed to import chat history")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to adapt different chat formats to our expected format
  function adaptChatFormat(data: any): { title: string; messages: Array<{ role: string; content: string }> } {
    // Default title
    let title = "Imported Chat " + new Date().toLocaleString()
    let messages = []

    // Case 1: Already in our expected format
    if (data.messages && Array.isArray(data.messages)) {
      messages = data.messages
      if (data.title) title = data.title
    }
    // Case 2: Array of messages at the root
    else if (Array.isArray(data)) {
      messages = data.map((msg) => {
        // Ensure each message has role and content
        if (!msg.role && (msg.sender || msg.from)) {
          // Map common sender fields to roles
          const sender = msg.sender || msg.from
          msg.role =
            sender === "user" || sender === "human"
              ? "user"
              : sender === "assistant" || sender === "ai" || sender === "bot"
                ? "assistant"
                : "system"
        }

        // Ensure content field exists
        if (!msg.content && (msg.text || msg.message)) {
          msg.content = msg.text || msg.message
        }

        return {
          role: msg.role || "user", // Default to user if no role
          content: msg.content || "No content provided",
        }
      })
    }
    // Case 3: Simple conversation format
    else if (data.conversation && Array.isArray(data.conversation)) {
      messages = data.conversation.map((msg) => ({
        role: msg.role || (msg.isUser ? "user" : "assistant"),
        content: msg.content || msg.text || msg.message || "No content provided",
      }))
      if (data.title) title = data.title
    }
    // Case 4: Create a simple conversation from text if all else fails
    else if (typeof data === "object") {
      // Try to extract any text content from the object
      const extractedMessages = []

      // Look for any properties that might contain messages
      for (const key in data) {
        if (typeof data[key] === "string" && data[key].length > 0) {
          extractedMessages.push({
            role: key.includes("user") || key.includes("human") ? "user" : "assistant",
            content: data[key],
          })
        } else if (Array.isArray(data[key])) {
          // Try to extract from arrays
          data[key].forEach((item: any) => {
            if (typeof item === "string" && item.length > 0) {
              extractedMessages.push({
                role: "user", // Default to user
                content: item,
              })
            } else if (typeof item === "object" && (item.text || item.content || item.message)) {
              extractedMessages.push({
                role: item.role || item.sender || "user",
                content: item.text || item.content || item.message,
              })
            }
          })
        }
      }

      if (extractedMessages.length > 0) {
        messages = extractedMessages
      } else {
        // If we couldn't extract messages, create a single message with the JSON
        messages = [
          {
            role: "user",
            content: "Imported data: " + JSON.stringify(data, null, 2),
          },
        ]
      }
    }

    // Validate and fix messages
    const validRoles = ["user", "assistant", "system"]
    messages = messages.map((msg) => ({
      role: validRoles.includes(msg.role) ? msg.role : "user",
      content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
    }))

    // Ensure we have at least one message
    if (messages.length === 0) {
      messages = [
        {
          role: "user",
          content: "Imported chat with no messages",
        },
      ]
    }

    return { title, messages }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Import Chat History</CardTitle>
          <CardDescription>Upload a JSON file or paste JSON data containing your chat history</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file">
            <TabsList className="mb-4">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="paste">Paste JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" accept=".json" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-500 hover:text-blue-700 block mb-2">
                  {file ? file.name : "Click to select a JSON file"}
                </label>
                <p className="text-sm text-gray-500">The file should contain chat messages in JSON format</p>
                <Button variant="outline" size="sm" onClick={downloadSample} className="mt-2">
                  Download Sample File
                </Button>
              </div>

              {detectedFormat && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium mb-1 text-sm">Detected Format:</h3>
                  <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto">
                    {JSON.stringify(detectedFormat, null, 2)}
                  </pre>
                </div>
              )}

              <Button onClick={() => handleImport("file")} disabled={!file || isLoading} className="w-full">
                {isLoading ? "Importing..." : "Import from File"}
              </Button>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <Textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"title": "My Chat", "messages": [{"role": "user", "content": "Hello"}]}'
                className="min-h-[200px] p-2 font-mono text-sm"
              />

              <Button onClick={() => handleImport("text")} disabled={!jsonText.trim() || isLoading} className="w-full">
                {isLoading ? "Importing..." : "Import from Text"}
              </Button>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="mt-4 bg-blue-50 p-3 rounded-md">
            <h3 className="font-medium mb-2 text-blue-800">Supported Formats:</h3>
            <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
              <li>
                Standard format with <code>title</code> and <code>messages</code> array
              </li>
              <li>
                Array of message objects with <code>role</code> and <code>content</code>
              </li>
              <li>
                Conversation format with <code>conversation</code> array
              </li>
              <li>Various other common chat export formats</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
