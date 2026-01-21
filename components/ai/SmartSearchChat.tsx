'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageSquare, Send, X, Bot, MapPin, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface AIResponse {
    filters: any;
    items: any[];
    message: string;
}

export default function SmartSearchChat({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text?: string, data?: AIResponse }[]>([
      { role: 'assistant', text: "Hi! I'm your AI assistant. Tell me what you're looking for or what you've found! (e.g. 'I lost my red wallet in Central Park')" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!query.trim() || loading) return;

      const userQuery = query;
      setQuery('');
      setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
      setLoading(true);

      try {
          const { data } = await api.post('/ai/search', { query: userQuery });
          setMessages(prev => [...prev, { role: 'assistant', text: data.message, data }]);
      } catch (error) {
          console.error("AI Error", error);
          setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error processing your request. Please try again." }]);
      } finally {
          setLoading(false);
      }
  };

  return (
    <AnimatePresence mode="wait">
      {!isOpen ? (
        <motion.div
          key="chat-button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center p-0"
          >
            <Bot className="w-8 h-8 text-white" />
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="chat-window"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-bold">Reclaim AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                  {/* Render Found Items Mini-Cards */}
                  {msg.data?.items && msg.data.items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Top Matches
                      </p>
                      {msg.data.items.slice(0, 3).map((item: any) => (
                        <Link
                          key={item._id}
                          href={`/items/${item._id}`}
                          className="block"
                        >
                          <div className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-gray-100 dark:border-gray-800">
                            {item.images?.[0] ? (
                              <img
                                src={item.images[0]}
                                alt=""
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <SearchIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <p className="font-bold truncate text-xs">
                                {item.title}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 truncate">
                                <MapPin className="w-3 h-3 mr-1" />
                                {item.location?.city || "Unknown Location"}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/?${new URLSearchParams({
                            ...(msg.data.filters?.search && { search: msg.data.filters.search }),
                            ...(msg.data.filters?.type && { type: msg.data.filters.type }),
                            ...(msg.data.filters?.category && { category: msg.data.filters.category }),
                            ...(msg.data.filters?.location && { location: msg.data.filters.location }),
                            ...(msg.data.filters?.city && { city: msg.data.filters.city }),
                            ...(msg.data.filters?.country && { country: msg.data.filters.country }),
                        }).toString()}`}
                        className="block text-center text-xs text-blue-600 hover:underline mt-1"
                      >
                        View all results
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none p-4 shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2 shrink-0"
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 border-0 focus-visible:ring-1"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!query.trim() || loading}
              className="rounded-full h-10 w-10 shrink-0 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
