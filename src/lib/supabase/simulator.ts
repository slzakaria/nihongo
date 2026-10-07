import { createClient } from '@/lib/supabase/client'
import { ChatMessage } from '@/types'

export async function fetchConversation(
  userId: string,
  scenarioSlug: string
): Promise<ChatMessage[] | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('simulator_conversations')
    .select('messages')
    .eq('user_id', userId)
    .eq('scenario_slug', scenarioSlug)
    .maybeSingle()
  if (error) console.error(error)
  return (data?.messages as ChatMessage[] | undefined) ?? null
}

export async function saveConversation(userId: string, scenarioSlug: string, messages: ChatMessage[]) {
  const supabase = createClient()
  const { error } = await supabase.from('simulator_conversations').upsert({
    user_id: userId,
    scenario_slug: scenarioSlug,
    messages,
    updated_at: new Date().toISOString(),
  })
  if (error) console.error(error)
}

export async function clearConversation(userId: string, scenarioSlug: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('simulator_conversations')
    .delete()
    .eq('user_id', userId)
    .eq('scenario_slug', scenarioSlug)
  if (error) console.error(error)
}
