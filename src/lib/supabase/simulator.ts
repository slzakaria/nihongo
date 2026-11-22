import { createClient } from "@/lib/supabase/client";
import { ChatMessage } from "@/types";

export async function fetchConversation(
  userId: string,
  scenarioSlug: string,
): Promise<ChatMessage[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("simulator_conversations")
    .select("messages")
    .eq("user_id", userId)
    .eq("scenario_slug", scenarioSlug)
    .maybeSingle();
  if (error) console.error(error);
  return (data?.messages as ChatMessage[] | undefined) ?? null;
}

export interface ConversationSummary {
  scenarioSlug: string;
  userTurns: number;
  updatedAt: string;
}

// One row per scenario the user has practised, for the profile page
export async function fetchConversationSummaries(
  userId: string,
): Promise<ConversationSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("simulator_conversations")
    .select("scenario_slug, messages, updated_at")
    .eq("user_id", userId);
  if (error) console.error(error);
  return (
    (data ?? []) as {
      scenario_slug: string;
      messages: ChatMessage[] | null;
      updated_at: string;
    }[]
  ).map((row) => ({
    scenarioSlug: row.scenario_slug,
    userTurns: (row.messages ?? []).filter((m) => m.role === "user").length,
    updatedAt: row.updated_at,
  }));
}

export async function saveConversation(
  userId: string,
  scenarioSlug: string,
  messages: ChatMessage[],
) {
  const supabase = createClient();
  const { error } = await supabase.from("simulator_conversations").upsert({
    user_id: userId,
    scenario_slug: scenarioSlug,
    messages,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error(error);
}

export async function clearConversation(userId: string, scenarioSlug: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("simulator_conversations")
    .delete()
    .eq("user_id", userId)
    .eq("scenario_slug", scenarioSlug);
  if (error) console.error(error);
}
