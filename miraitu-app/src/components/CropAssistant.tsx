'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface CropAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
    '🌾 How to grow wheat step by step?',
    '🐛 Best way to control pests on crops?',
    '🌱 Which crop is best for my soil type?',
];

export default function CropAssistant({ isOpen, onClose }: CropAssistantProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose]);

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setInput('');
        setError(null);

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch('/api/crop-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong.');
            }

            setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unable to get a response.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [messages, loading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void sendMessage(input);
    };

    // Simple markdown-lite renderer: bold, bullets, numbered lists
    const renderContent = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Bold **text**
            const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return <span key={j}>{part}</span>;
            });

            // Bullet points
            if (/^\s*[-•]\s/.test(line)) {
                return <li key={i} className="ml-4 list-disc">{parts}</li>;
            }
            // Numbered list
            if (/^\s*\d+[.)]\s/.test(line)) {
                return <li key={i} className="ml-4 list-decimal">{parts}</li>;
            }
            // Empty line → spacing
            if (!line.trim()) {
                return <br key={i} />;
            }
            return <p key={i}>{parts}</p>;
        });
    };

    if (!isOpen || !mounted) return null;

    const panel = (
        <div
            ref={panelRef}
            className="fixed z-[60] inset-x-3 bottom-3 sm:inset-x-auto sm:right-4 sm:bottom-6 lg:right-10 lg:bottom-10 w-auto sm:w-[360px] md:w-[400px] bg-white dark:bg-[#1a231a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
            style={{ maxHeight: 'min(480px, calc(100vh - 6rem))', height: 'min(480px, calc(100vh - 6rem))' }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white shrink-0">
                <span className="material-symbols-outlined text-2xl">psychiatry</span>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">Miraitu Crop Assistant</p>
                    <p className="text-[11px] opacity-80">Ask anything about crops & farming</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Close"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-3">
                {messages.length === 0 && !loading && (
                    <div className="space-y-3">
                        <div className="bg-green-50 dark:bg-green-950/40 rounded-xl p-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                👋 Hello! I&apos;m your crop assistant. Ask me anything about crops, farming tips, pest control, and more!
                            </p>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick questions:</p>
                        <div className="flex flex-col gap-2">
                            {SUGGESTED_QUESTIONS.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => {
                                        setInput(q);
                                        inputRef.current?.focus();
                                    }}
                                    className="text-sm px-3 py-2 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-left"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-green-600 text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                                }`}
                        >
                            {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
                onSubmit={handleSubmit}
                className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-2.5 md:px-3 py-2 md:py-2.5 flex items-center gap-2 bg-white dark:bg-[#1a231a]"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about any crop..."
                    maxLength={1000}
                    disabled={loading}
                    className="flex-1 min-w-0 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 md:px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-40"
                    aria-label="Send message"
                >
                    <span className="material-symbols-outlined text-lg">send</span>
                </button>
            </form>
        </div>
    );

    return createPortal(panel, document.body);
}
