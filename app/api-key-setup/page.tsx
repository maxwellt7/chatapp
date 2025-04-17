"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ApiKeySetupPage() {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSaveApiKey() {
    if (!apiKey.trim()) {
      setError("Please enter an API key")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Note: In a real application, you would save this to a secure storage
      // For this demo, we'll just show instructions

      // Simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Success message
      alert(
        "In a real application, you would now save this API key to your environment variables. For this demo, please add it to your Vercel project settings.",
      )

      router.push("/")
    } catch (error) {
      console.error("Error saving API key:", error)
      setError("Failed to save API key")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>OpenRouter API Key Setup</CardTitle>
          <CardDescription>Enter your OpenRouter API key to enable AI chat functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="w-full"
              />
              <p className="mt-2 text-sm text-gray-500">
                Get your API key from{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  OpenRouter
                </a>
              </p>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="bg-blue-50 p-3 rounded-md">
              <h3 className="font-medium text-blue-800 mb-1">How to set up your API key:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
                <li>
                  Create an account on{" "}
                  <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">
                    OpenRouter
                  </a>
                </li>
                <li>Generate an API key in your OpenRouter dashboard</li>
                <li>
                  Add the API key to your environment variables as <code>API_KEY</code>
                </li>
                <li>Restart your application</li>
              </ol>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey} disabled={!apiKey.trim() || isLoading}>
              {isLoading ? "Saving..." : "Save API Key"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
