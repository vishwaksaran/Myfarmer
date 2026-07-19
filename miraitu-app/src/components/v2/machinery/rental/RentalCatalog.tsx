'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    getRentalCategory,
    unitLabel,
    type RentalItem,
    type RentalQuestion,
} from '@/lib/machinery-rental-catalog';
import { useMachineryCart } from '@/context/MachineryBookingCart';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function RentalCatalog({ category }: { category: string }) {
    const config = getRentalCategory(category);
    const { addLine, totalItems, subtotal } = useMachineryCart();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<RentalItem | null>(null);

    const items = useMemo(() => {
        if (!config) return [];
        const q = search.trim().toLowerCase();
        if (!q) return config.items;
        return config.items.filter(i => i.name.toLowerCase().includes(q));
    }, [config, search]);

    if (!config) {
        return (
            <div className="px-4 md:px-6 py-12 text-center">
                <p className="text-gray-500">This rental category is not available yet.</p>
                <Link href="/home/machinery" className="text-primary font-semibold">Back to Machinery</Link>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-6 pb-28">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category={category} currentAction="rent" />

                {/* Header */}
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl">{config.icon}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rent {config.title}</h1>
                            <p className="text-sm text-gray-500">{config.blurb}</p>
                        </div>
                    </div>
                    <Link href="/home/machinery/bookings" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                        <span className="material-symbols-outlined text-lg">receipt_long</span>
                        My Bookings
                    </Link>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search services"
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-primary outline-none text-sm"
                    />
                </div>

                {/* Item cards */}
                {items.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No items match your search.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                                <button onClick={() => setSelected(item)} className="relative h-44 w-full overflow-hidden text-left">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="absolute bottom-2 left-2 flex gap-1">
                                            {item.tags.slice(0, 2).map(t => (
                                                <span key={t} className="text-[10px] font-semibold bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                                <div className="p-4 flex flex-col flex-1">
                                    <button onClick={() => setSelected(item)} className="text-left">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{item.name}</h3>
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{item.description}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-lg font-black text-primary">{inr(item.price)}<span className="text-xs font-medium text-gray-400">{unitLabel[item.unit]}</span></p>
                                        <button onClick={() => setSelected(item)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all">
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Item detail sheet */}
            {selected && (
                <ItemDetailSheet
                    item={selected}
                    category={category}
                    questions={config.questions}
                    maxQuantity={config.maxQuantity ?? 5}
                    onClose={() => setSelected(null)}
                    onAdd={(line) => { addLine(line); setSelected(null); }}
                />
            )}

            {/* Floating cart bar */}
            {totalItems > 0 && (
                <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
                    <button
                        onClick={() => router.push('/home/machinery/cart')}
                        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 active:scale-[0.99] transition-transform"
                    >
                        <span className="flex items-center gap-2 font-bold">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            {totalItems} item{totalItems > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-2 font-bold">
                            {inr(subtotal)}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Item detail sheet ───────────────────────────────────────────────
function ItemDetailSheet({
    item, category, questions, maxQuantity, onClose, onAdd,
}: {
    item: RentalItem;
    category: string;
    questions: RentalQuestion[];
    maxQuantity: number;
    onClose: () => void;
    onAdd: (line: { category: string; itemId: string; name: string; price: number; unit: RentalItem['unit']; image: string; quantity: number; answers: Record<string, string> }) => void;
}) {
    const [quantity, setQuantity] = useState(1);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setAnswer = (id: string, val: string) => {
        setAnswers(prev => ({ ...prev, [id]: val }));
        setErrors(prev => { const { [id]: _, ...rest } = prev; return rest; });
    };

    const handleAdd = () => {
        const errs: Record<string, string> = {};
        for (const q of questions) {
            if (q.required && !answers[q.id]?.trim()) errs[q.id] = 'Required';
        }
        if (Object.keys(errs).length) { setErrors(errs); return; }
        onAdd({
            category,
            itemId: item.id,
            name: item.name,
            price: item.price,
            unit: item.unit,
            image: item.image,
            quantity,
            answers,
        });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative bg-white dark:bg-[#1a231a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-48">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover sm:rounded-t-3xl" />
                    <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
                        <span className="material-symbols-outlined text-gray-700">close</span>
                    </button>
                </div>
                <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h2>

                    <div className="mt-3 flex items-center justify-between bg-primary/10 rounded-2xl px-4 py-3">
                        <span className="text-primary font-medium">Amount</span>
                        <span className="text-xl font-black text-primary">{inr(item.price)}<span className="text-xs font-medium text-gray-400">{unitLabel[item.unit]}</span></span>
                    </div>

                    {/* Quantity */}
                    <div className="mt-5">
                        <p className="font-bold text-gray-900 dark:text-white mb-2">Quantity (Per Day)</p>
                        <div className="flex gap-2 flex-wrap">
                            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setQuantity(n)}
                                    className={`w-11 h-11 rounded-full font-bold text-sm transition-all ${quantity === n ? 'bg-primary text-white' : 'border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Relevant questions */}
                    {questions.length > 0 && (
                        <div className="mt-5 space-y-4">
                            {questions.map((q) => (
                                <div key={q.id}>
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                                        {q.label}{q.required && <span className="text-red-500"> *</span>}
                                    </label>
                                    {q.type === 'select' ? (
                                        <div className="flex flex-wrap gap-2">
                                            {q.options?.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setAnswer(q.id, opt)}
                                                    className={`px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${answers[q.id] === opt ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type={q.type === 'number' ? 'number' : 'text'}
                                            value={answers[q.id] ?? ''}
                                            onChange={(e) => setAnswer(q.id, e.target.value)}
                                            placeholder={q.placeholder}
                                            className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${errors[q.id] ? 'border-red-400' : 'border-transparent'} focus:border-primary outline-none text-sm`}
                                        />
                                    )}
                                    {errors[q.id] && <p className="text-red-500 text-xs mt-1">{errors[q.id]}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {item.description && (
                        <div className="mt-5">
                            <p className="font-bold text-gray-900 dark:text-white mb-1">Description</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                    )}

                    <button
                        onClick={handleAdd}
                        className="w-full mt-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 active:scale-[0.99] transition-all"
                    >
                        Add to cart · {inr(item.price * quantity)}
                    </button>
                </div>
            </div>
        </div>
    );
}
