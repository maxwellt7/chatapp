"use client"

import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the entire client-side application
let supabaseClient: ReturnType<typeof createClient> | null = null

export function createClientSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey)
  return supabaseClient
}
