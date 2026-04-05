'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const SUGGESTED_QUESTIONS = [
    'How to grow tomatoes in summer?',
    'Best crops for black soil?',
    'Wheat cultivation do\'s and don\'ts',
    'How to control pests in rice?',
    'Which fertilizer for sugarcane?',
    'Sowing calendar for Rabi season',
];

export default function CropAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

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
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

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

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`fixed z-50 bottom-24 md:bottom-6 right-20 md:right-24 lg:right-28 flex items-center justify-center h-14 w-14 lg:h-16 lg:w-16 rounded-full text-white shadow-lg transition-all active:scale-95 hover:-translate-y-1 ${isOpen
                        ? 'bg-gradient-to-br from-red-500 to-red-700'
                        : 'bg-gradient-to-br from-green-500 to-green-700'
                    }`}
                aria-label={isOpen ? 'Close crop assistant' : 'Open crop assistant'}
            >
                <span className="material-symbols-outlined text-2xl lg:text-3xl relative z-10">
                    {isOpen ? 'close' : 'psychiatry'}
                </span>
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="fixed z-[60] bottom-[7rem] md:bottom-24 right-4 md:right-24 lg:right-28 w-[calc(100vw-2rem)] max-w-[420px] bg-white dark:bg-[#1a231a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
                    style={{ maxHeight: 'min(600px, calc(100vh - 10rem))' }}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white shrink-0">
                        <span className="material-symbols-outlined text-2xl">psychiatry</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">Miraitu Crop Assistant</p>
                            <p className="text-[11px] opacity-80">Ask anything about crops & farming</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                            aria-label="Close"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: '200px' }}>
                        {messages.length === 0 && !loading && (
                            <div className="space-y-3">
                                <div className="bg-green-50 dark:bg-green-950/40 rounded-xl p-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        👋 Hello! I&apos;m your crop assistant. Ask me about crop cultivation, pest control, best varieties, farming tips, and more!
                                    </p>
                                </div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Try asking:</p>
                                <div className="flex flex-wrap gap-2">
                                    {SUGGESTED_QUESTIONS.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => void sendMessage(q)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-left"
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
                        className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-3 py-2.5 flex items-center gap-2 bg-white dark:bg-[#1a231a]"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about any crop..."
                            maxLength={1000}
                            disabled={loading}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
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
            )}
        </>
    );
}
