import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { clearChatSession, sendChat } from "../services/api";

const MSG_KEY = "hospital-ai-chat";
const SESSION_KEY = "hospital-ai-session";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(MSG_KEY)) || [];
    return saved.map((m) => ({ ...m, animate: false })); // never re-animate old messages
  } catch {
    return [];
  }
}

export default function useChat() {
  const [messages, setMessages] = useState(loadMessages);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY) || uid());

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, sessionId);
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem(MSG_KEY, JSON.stringify(messages.slice(-200)));
  }, [messages]);

  const send = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || loading) return;

      setMessages((prev) => [...prev, { id: uid(), role: "user", content, time: Date.now() }]);
      setLoading(true);
      try {
        const data = await sendChat(content, sessionId);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: data.answer,
            time: Date.now(),
            medicines: data.medicines || [],
            toolUsed: data.tool_used,
            llmUsed: data.llm_used,
            animate: true,
          },
        ]);
      } catch (err) {
        toast.error(err.message);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: `Sorry, something went wrong: ${err.message}`,
            time: Date.now(),
            error: true,
            animate: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId]
  );

  const clear = useCallback(() => {
    clearChatSession(sessionId).catch(() => {}); // best effort
    setMessages([]);
    setSessionId(uid());
    toast.success("Chat cleared");
  }, [sessionId]);

  return { messages, loading, send, clear };
}