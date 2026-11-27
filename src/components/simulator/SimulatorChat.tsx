'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimulatorMessage } from '@/components/simulator/SimulatorMessage';
import { ChatMessage } from '@/types';
import { getScenarioStarter } from '@/lib/simulator/prompts';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAuthStore } from '@/store/auth';
import { useContentStore } from '@/lib/data/content';
import {
  fetchConversation,
  saveConversation,
  clearConversation,
} from '@/lib/supabase/simulator';
import { recordStudyDay } from '@/lib/supabase/activity';
import { FeedbackPanel } from '@/components/simulator/FeedbackPanel';
import { showRateLimitDialog } from '@/store/rateLimitDialog';
import { scenarioKana } from '@/lib/data/scenarioKana';
import { BilingualText } from '@/components/layout/BilingualText';
import { cn } from '@/lib/utils';

export function SimulatorChat({ scenarioSlug }: { scenarioSlug: string }) {
  const starter = getScenarioStarter(scenarioSlug);
  const scenario = useContentStore((s) =>
    s.content.phrases.find((sc) => sc.slug === scenarioSlug),
  );
  const user = useAuthStore((s) => s.user);
  // `messages` is what's shown on screen (includes the opening line); `apiHistory` is
  // what's sent to Claude — the opener never counts as a turn, so history always starts on 'user'
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    starter ? [{ role: 'assistant', content: starter }] : [],
  );
  const [apiHistory, setApiHistory] = useState<ChatMessage[]>([]);
  const [autoPlayIndex, setAutoPlayIndex] = useState<number | null>(null);
  const [resumed, setResumed] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef(input);
  const [isStreaming, setIsStreaming] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const {
    isSupported: micSupported,
    isListening,
    isTranscribing,
    error: micError,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition();

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // Browsers block autoplay-with-sound until the page has received a user gesture (click,
  // key press, or touch) — playing the opener immediately on mount fails silently every time
  // since there's been no interaction yet. Wait for the first gesture, then let it play.
  const resumedRef = useRef(resumed);
  useEffect(() => {
    resumedRef.current = resumed;
  }, [resumed]);

  useEffect(() => {
    if (!starter) return;
    const triggerAutoplay = () => {
      if (!resumedRef.current) setAutoPlayIndex(0);
    };
    window.addEventListener('pointerdown', triggerAutoplay, { once: true });
    window.addEventListener('keydown', triggerAutoplay, { once: true });
    return () => {
      window.removeEventListener('pointerdown', triggerAutoplay);
      window.removeEventListener('keydown', triggerAutoplay);
    };
  }, [starter]);

  // Keep the view anchored to the latest message any time the conversation changes
  // (new messages, streaming chunks, or a resumed conversation loading in). We scroll
  // the chat container's scrollTop directly instead of scrollIntoView, which would
  // also scroll the page itself into view and cause the whole page to jump.
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Resume a signed-in user's last conversation for this scenario, if any
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchConversation(user.id, scenarioSlug).then((saved) => {
      if (cancelled || !saved || saved.length === 0) return;
      setApiHistory(saved);
      setMessages(starter ? [{ role: 'assistant', content: starter }, ...saved] : saved);
      setAutoPlayIndex(null);
      setResumed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user, scenarioSlug, starter]);

  function startFresh() {
    setMessages(starter ? [{ role: 'assistant', content: starter }] : []);
    setApiHistory([]);
    setAutoPlayIndex(null);
    setResumed(false);
    if (user) void clearConversation(user.id, scenarioSlug);
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || isStreaming) return;

    const baseLen = messages.length;
    const nextApiHistory: ChatMessage[] = [
      ...apiHistory,
      { role: 'user', content: text },
    ];
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      void recordStudyDay(userId).catch((error) =>
        console.error('Unable to record simulator study activity.', error),
      );
    }
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsStreaming(true);

    try {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextApiHistory, scenarioSlug }),
      });

      if (res.status === 429) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        showRateLimitDialog(data?.error);
        setMessages((prev) => {
          const updated = [...prev];
          const hint = user ? 'try again tomorrow' : 'sign in for a higher daily limit';
          updated[baseLen + 1] = {
            role: 'assistant',
            content: `${data?.error ?? "You've reached today's usage limit."} [HINT: ${hint}]`,
          };
          return updated;
        });
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setMessages((prev) => {
          const updated = [...prev];
          updated[baseLen + 1] = {
            role: 'assistant',
            content: `${data?.error ?? 'Sorry, something went wrong.'} [HINT: connection error]`,
          };
          return updated;
        });
        return;
      }

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[baseLen + 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      }

      setApiHistory([...nextApiHistory, { role: 'assistant', content: assistantText }]);
      setAutoPlayIndex(baseLen + 1);
      if (user)
        void saveConversation(user.id, scenarioSlug, [
          ...nextApiHistory,
          { role: 'assistant', content: assistantText },
        ]);
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[baseLen + 1] = {
          role: 'assistant',
          content: 'Sorry, something went wrong. [HINT: connection error]',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  function handleMicClick() {
    if (isListening) {
      stopListening();
      return;
    }
    startListening((transcript) => {
      const combined = inputRef.current
        ? `${inputRef.current} ${transcript}`
        : transcript;
      setInput('');
      void sendMessage(combined);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {resumed && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span>Resumed from your last session</span>
          <button
            type="button"
            onClick={startFresh}
            className="font-medium underline hover:text-foreground"
          >
            Start fresh
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {scenario && (
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {scenario.icon}{' '}
              <BilingualText
                english={scenario.label}
                japanese={scenarioKana(scenario.slug) ?? 'シナリオ'}
              />
            </span>
          </div>
        )}

        <div
          ref={messagesContainerRef}
          className="flex h-[50vh] max-h-[50vh] min-h-0 flex-col gap-3 overflow-y-auto p-4"
        >
          {messages.map((m, i) => (
            <SimulatorMessage key={i} message={m} autoPlay={i === autoPlayIndex} />
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2 border-t border-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in any language..."
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {micSupported && (
            <Button
              type="button"
              variant={isListening ? 'secondary' : 'outline'}
              size="icon"
              loading={isTranscribing}
              aria-label={isListening ? 'Stop recording' : 'Record in Japanese'}
              onClick={handleMicClick}
              className={cn(isListening && 'ring-2 ring-red-500')}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            loading={isStreaming}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {messages.some((m) => m.role === 'user') && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setReviewOpen(true)}
          >
            Review my replies
          </Button>
        </div>
      )}
      {reviewOpen && (
        <FeedbackPanel
          scenarioSlug={scenarioSlug}
          messages={apiHistory}
          onClose={() => setReviewOpen(false)}
        />
      )}

      {(isListening || isTranscribing) && (
        <p
          role="status"
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          {isListening ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Listening… tap the mic again to stop
            </>
          ) : (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Transcribing…
            </>
          )}
        </p>
      )}
      {micError && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {micErrorMessage(micError)}
        </p>
      )}
    </div>
  );
}

function micErrorMessage(error: string): string {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return "Microphone access was denied. Allow it in your browser's site settings and try again.";
    case 'no-speech':
      return 'No speech detected — try again and speak right after tapping the mic.';
    case 'audio-capture':
      return 'No microphone found. Check that one is connected and enabled.';
    case 'network':
      return 'Speech recognition needs network access and failed to reach it — check your connection.';
    case 'stt-failed':
      return 'Could not transcribe that recording — please try again.';
    case 'rate-limited':
      return "You've reached the guest limit for voice features — sign in to continue.";
    case 'not-supported':
      return 'Speech recognition is not supported in this browser.';
    default:
      return `Mic error: ${error}`;
  }
}
