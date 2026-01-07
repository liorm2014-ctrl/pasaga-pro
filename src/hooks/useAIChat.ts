import { useState, useCallback } from 'react';
import { ConversationMessage } from '@/types';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reflection-chat`;

interface UseAIChatOptions {
  userContext?: {
    fullName?: string;
    gender?: string;
    district?: string;
    city?: string;
    numKindergartens?: number;
    numElementary?: number;
    numHighSchools?: number;
    trainingsCount?: number;
  };
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamChat = useCallback(async ({
    messages,
    onDelta,
    onDone,
  }: {
    messages: { role: string; content: string }[];
    onDelta: (deltaText: string) => void;
    onDone: () => void;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages,
          userContext: options.userContext,
        }),
      });

      if (resp.status === 429) {
        throw new Error("מגבלת בקשות הושגה, נסו שוב מאוחר יותר");
      }
      if (resp.status === 402) {
        throw new Error("נדרשת הוספת קרדיט לחשבון");
      }
      if (!resp.ok || !resp.body) {
        throw new Error("שגיאה בחיבור לשירות AI");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }

      onDone();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "שגיאה לא ידועה";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options.userContext]);

  return { streamChat, isLoading, error };
}
