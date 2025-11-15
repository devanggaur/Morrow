import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";

const suggestions = [
  "How much can I save today?",
  "Which savings methods fit me?",
  "Help me create a rule",
  "What changed in my spending?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CoachTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Morrow, your AI money coach. I'm here to help you save smarter and reach your goals. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
      {
        role: "assistant",
        content: "That's a great question! In a real app, I'd use AI to analyze your spending patterns and give you personalized advice.",
      },
    ];

    setMessages(newMessages);
    setInput("");
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="h-screen flex flex-col bg-background pb-20">
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-bold">Ask Morrow</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {suggestions.map((suggestion, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="px-4 py-2 cursor-pointer hover-elevate"
                onClick={() => handleSuggestion(suggestion)}
                data-testid={`suggestion-${i}`}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything about your money…"
            className="flex-1 rounded-full py-6"
            data-testid="input-chat"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="rounded-full h-12 w-12 flex-shrink-0"
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
