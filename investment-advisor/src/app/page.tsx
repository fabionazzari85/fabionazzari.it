"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import {
  ChatMessage,
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  getApiKey,
  getProfile,
  getPortfolio,
} from "@/lib/storage";
import { Disclaimer } from "@/components/Disclaimer";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(getChatHistory());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustTextarea = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setError("Configura la tua API key nelle Impostazioni.");
      return;
    }

    const profile = getProfile();
    const portfolio = getPortfolio();

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatHistory(newMessages);
    setInput("");
    setError("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          apiKey,
          profile,
          portfolio,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Errore ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content,
        timestamp: Date.now(),
      };

      const updated = [...newMessages, assistantMsg];
      setMessages(updated);
      saveChatHistory(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore nella comunicazione"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    clearChatHistory();
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full">
      <Disclaimer />

      {/* Header */}
      <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border z-10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Investment Advisor</h1>
          <p className="text-xs text-muted">Il tuo assistente AI</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-muted hover:text-danger p-2 rounded-lg transition-colors"
            title="Cancella chat"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <div className="text-5xl">📈</div>
            <h2 className="text-xl font-bold">Ciao!</h2>
            <p className="text-muted text-sm max-w-xs">
              Sono il tuo assistente per gli investimenti. Dimmi quanto vuoi
              investire e ti aiuto a trovare le migliori opportunita.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Ho 300 euro, dove li metto?",
                "Come sta andando il mercato?",
                "Analizza il mio portfolio",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs bg-card hover:bg-card-hover border border-border rounded-full px-3 py-2 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-card border border-border rounded-bl-md chat-message"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(msg.content),
                  }}
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 size={18} className="animate-spin text-primary" />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-16 bg-background border-t border-border px-4 py-3">
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextarea();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Scrivi un messaggio..."
            rows={1}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white p-3 rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^### (.*$)/gm, '<h3 class="font-bold text-base mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="font-bold text-lg mt-3 mb-1">$1</h2>')
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.*$)/gm, "<li>$1. $2</li>")
    .replace(
      /(<li>[\s\S]*<\/li>)/,
      '<ul class="list-disc ml-4">$1</ul>'
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^(.*)$/, "<p>$1</p>");
}
