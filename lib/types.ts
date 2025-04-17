export interface Message {
  id?: string
  role: "user" | "assistant" | "system"
  content: string
  created_at?: string
}

export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}
