import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User as UserIcon, Ticket, Sparkles, HelpCircle, ArrowRight, Trash2 } from "lucide-react";
import api from "../lib/axios";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import type { CatalogEvent } from "../types";

interface Message {
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  cards?: CatalogEvent[];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I am your booking assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(async () => {
      let botResponseText = "";
      let botCards: CatalogEvent[] = [];
      const cleanText = text.toLowerCase().trim();

      try {
        if (cleanText.includes("movie") || cleanText.includes("film") || cleanText.includes("cinema")) {
          // Fetch live movies
          const res = await api.get("/catalog/movies");
          const items: CatalogEvent[] = res.data.items || [];
          if (items.length > 0) {
            botResponseText = "Here are the movies currently available for booking:";
            botCards = items.slice(0, 3); // limit to 3 items
          } else {
            botResponseText = "There are no movies listed in the catalog at the moment.";
          }
        } else if (cleanText.includes("concert") || cleanText.includes("music") || cleanText.includes("show")) {
          // Fetch live concerts
          const res = await api.get("/catalog/concert");
          const items: CatalogEvent[] = res.data.items || [];
          if (items.length > 0) {
            botResponseText = "Here are the upcoming concerts you can book:";
            botCards = items.slice(0, 3);
          } else {
            botResponseText = "We don't have any concerts listed in the catalog right now.";
          }
        } else if (cleanText.includes("train") || cleanText.includes("ticket") && (cleanText.includes("travel") || cleanText.includes("ride"))) {
          // Fetch live trains
          const res = await api.get("/catalog/train");
          const items: CatalogEvent[] = res.data.items || [];
          if (items.length > 0) {
            botResponseText = "Here are the available train routes:";
            botCards = items.slice(0, 3);
          } else {
            botResponseText = "No train routes are currently scheduled.";
          }
        } else if (cleanText.includes("balance") || cleanText.includes("money") || cleanText.includes("wallet")) {
          if (!user) {
            botResponseText = "You need to log in to check your account balance.";
          } else {
            // Re-fetch user details to get fresh balance
            try {
              const res = await api.get("/auth/me");
              const currentBalance = res.data.user?.balance ?? user.balance;
              botResponseText = `Hi ${user.name || "there"}! Your current wallet balance is $${currentBalance}.`;
            } catch {
              botResponseText = `Your current balance is $${user.balance}.`;
            }
          }
        } else if (cleanText.includes("refund") || cleanText.includes("cancel")) {
          botResponseText = "To get a refund: go to your Profile page, click on 'My Bookings', find the booking you want to cancel, and click 'Cancel Booking'. The refund will be credited back to your wallet balance instantly.";
        } else if (cleanText.includes("hello") || cleanText.includes("hi ") || cleanText === "hi") {
          botResponseText = user 
            ? `Hello ${user.name}! I can help you search for movies, concerts, or trains, check your wallet balance, and guide you through refunds. What would you like to do?`
            : "Hello! I can help you search for movies, concerts, or trains, and guide you through refunds. Please log in to check your wallet balance. What would you like to do?";
        } else {
          botResponseText = "I'm not sure about that. Try asking me about:\n• Available movies, concerts, or trains\n• Your wallet balance\n• Cancellation and refund policy";
        }
      } catch (err) {
        console.error("Chatbot query error:", err);
        botResponseText = "Sorry, I had trouble retrieving that information. Please try again in a moment.";
      }

      const botMessage: Message = {
        sender: "bot",
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cards: botCards.length > 0 ? botCards : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggest = (topic: string) => {
    handleSend(topic);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "Chat cleared. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-3xl border border-(--app-border) bg-(--app-surface)/95 backdrop-blur-md shadow-2xl shadow-black/40 transition-all duration-300 sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-(--app-border) bg-gradient-to-r from-(--app-surface) to-(--app-surface-2) px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-(--app-accent) text-(--app-accent-fg)">
                <Bot className="h-5 w-5 animate-pulse" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-(--app-surface) bg-green-500"></span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-(--app-fg)">Booking Assistant</h3>
                <p className="text-[10px] text-green-500 font-medium">Online • Instant Help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                title="Clear Chat"
                className="rounded-full p-1.5 text-(--app-muted) hover:bg-(--app-surface-2) hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-(--app-muted) hover:bg-(--app-surface-2) hover:text-(--app-fg)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--app-border) text-(--app-fg)">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-(--app-accent) text-(--app-accent-fg) rounded-tr-none"
                        : "bg-(--app-surface-2) text-(--app-fg) rounded-tl-none border border-(--app-border)"
                    }`}
                  >
                    {msg.text}

                    {/* Rich Event Cards */}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.cards.map((card) => (
                          <div 
                            key={card.id} 
                            className="overflow-hidden rounded-xl border border-(--app-border) bg-(--app-surface) shadow-sm"
                          >
                            <img src={card.image} alt={card.title} className="h-24 w-full object-cover opacity-90" />
                            <div className="p-3">
                              <h4 className="font-semibold text-xs text-(--app-fg)">{card.title}</h4>
                              <p className="mt-0.5 text-[10px] text-(--app-muted)">{card.venue} • Starting at ${card.price}</p>
                              {(!user || user.role === "user") && (
                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/book/${card.id}`);
                                  }}
                                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-(--app-accent) py-1.5 text-xs font-semibold text-(--app-accent-fg) hover:bg-(--app-accent-hover)"
                                >
                                  <Ticket className="h-3.5 w-3.5" />
                                  Book Now
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-(--app-muted) px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--app-accent) text-(--app-accent-fg)">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--app-border) text-(--app-fg)">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-(--app-border) bg-(--app-surface-2) px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-(--app-muted)" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-(--app-muted)" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-(--app-muted)" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="flex flex-wrap gap-1.5 border-t border-(--app-border) px-4 py-2 bg-(--app-surface-2)/50">
            <button
              onClick={() => handleSuggest("Show available movies")}
              className="flex items-center gap-1 rounded-full border border-(--app-border) bg-(--app-surface) px-2.5 py-1 text-xs text-(--app-fg) hover:border-(--app-muted)"
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              Movies
            </button>
            <button
              onClick={() => handleSuggest("Are there any concerts?")}
              className="flex items-center gap-1 rounded-full border border-(--app-border) bg-(--app-surface) px-2.5 py-1 text-xs text-(--app-fg) hover:border-(--app-muted)"
            >
              <Sparkles className="h-3 w-3 text-purple-500" />
              Concerts
            </button>
            <button
              onClick={() => handleSuggest("Check train routes")}
              className="flex items-center gap-1 rounded-full border border-(--app-border) bg-(--app-surface) px-2.5 py-1 text-xs text-(--app-fg) hover:border-(--app-muted)"
            >
              <Sparkles className="h-3 w-3 text-blue-500" />
              Trains
            </button>
            <button
              onClick={() => handleSuggest("What is my wallet balance?")}
              className="flex items-center gap-1 rounded-full border border-(--app-border) bg-(--app-surface) px-2.5 py-1 text-xs text-(--app-fg) hover:border-(--app-muted)"
            >
              <Sparkles className="h-3 w-3 text-emerald-500" />
              My Balance
            </button>
            <button
              onClick={() => handleSuggest("How do refunds work?")}
              className="flex items-center gap-1 rounded-full border border-(--app-border) bg-(--app-surface) px-2.5 py-1 text-xs text-(--app-fg) hover:border-(--app-muted)"
            >
              <HelpCircle className="h-3 w-3 text-red-500" />
              Refund Policy
            </button>
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex items-center gap-2 border-t border-(--app-border) bg-(--app-surface) p-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-xl border border-(--app-border) bg-(--app-surface-2) px-3 py-2 text-sm text-(--app-fg) outline-none focus:border-(--app-muted)"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--app-accent) text-(--app-accent-fg) transition hover:bg-(--app-accent-hover) disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-(--app-accent) text-(--app-accent-fg) shadow-lg shadow-black/30 hover:scale-105 hover:bg-(--app-accent-hover)"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
}
