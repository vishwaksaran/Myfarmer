'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    getServiceCategory,
    serviceCategoryList,
    serviceUnitLabel,
    type ServiceItem,
    type ServiceQuestion,
} from '@/lib/service-catalog';
import { useServiceCart } from '@/context/ServiceBookingCart';
import { useLanguage } from '@/i18n/LanguageContext';
import { translateCatalog } from '@/i18n/serviceCatalogContent';
import { translatePage } from '@/i18n/pageContent';
import { serviceDirectory, type ServiceDirectoryEntry } from '@/lib/service-directory';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function ServiceCatalog({ category }: { category: string }) {
    const config = getServiceCategory(category);
    const { addLine, totalItems, subtotal } = useServiceCart();
    const router = useRouter();
    const { t, lang } = useLanguage();
    // Translate catalog content (item names, descriptions, tags) by source text.
    const tc = (s?: string) => translateCatalog(lang, s);
    // Translate a directory entry's display name (dot-key or source string).
    const dirName = (e: ServiceDirectoryEntry) => (e.tKey ? t(e.tKey) : translatePage(lang, e.name));

    const [search, setSearch] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [selected, setSelected] = useState<ServiceItem | null>(null);

    const items = useMemo(() => {
        if (!config) return [];
        const q = search.trim().toLowerCase();
        if (!q) return config.items;
        // Match against both the English name and its translation so search
        // works whichever language the catalog is displayed in.
        return config.items.filter(i =>
            i.name.toLowerCase().includes(q) || tc(i.name).toLowerCase().includes(q)
        );
    }, [config, search, lang]);

    // Global search: matching services across the whole app for the dropdown.
    const suggestions = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return [];
        return serviceDirectory
            .filter(e => e.name.toLowerCase().includes(q) || dirName(e).toLowerCase().includes(q))
            .slice(0, 8);
    }, [search, lang]);

    if (!config) {
        return (
            <div className="px-4 md:px-6 py-12 text-center">
                <p className="text-gray-500">{t('catalog.notAvailable')}</p>
                <Link href="/home/services" className="text-primary font-semibold">{t('catalog.backToServices')}</Link>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-6 pb-28">
            <div className="mx-auto max-w-[1024px]">
                {/* Header row */}
                <div className="flex items-center gap-3 mb-5">
                    <Link href="/home/services" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </Link>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex-1 text-center">{t(config.titleKey)}</h1>
                    {/* Spacer keeps the title centered; cart lives in the app header + floating bar */}
                    <div className="w-9 shrink-0" aria-hidden="true" />
                </div>

                {/* Search — with a global "jump to any service" dropdown */}
                <div className="relative mb-5 z-30">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                        placeholder={t('catalog.searchServices')}
                        className="w-full pl-12 pr-10 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-primary outline-none text-sm"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Clear search"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}

                    {/* Suggestions dropdown — cross-service quick jump */}
                    {searchFocused && search.trim() && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                            {suggestions.map((e) => (
                                <Link
                                    key={e.href}
                                    href={e.href}
                                    onClick={() => { setSearch(''); setSearchFocused(false); }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/60 last:border-b-0"
                                >
                                    <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary text-lg">{e.icon}</span>
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{dirName(e)}</span>
                                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 ml-auto text-lg">chevron_right</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category chips */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t('catalog.allCategories')}</h2>
                    <div className="flex gap-4 overflow-x-auto md:overflow-x-visible md:flex-wrap pt-2 pb-2 -mx-1 px-1 no-scrollbar">
                        {serviceCategoryList.map((c) => {
                            const active = c.slug === category;
                            return (
                                <Link key={c.slug} href={`/home/services/book/${c.slug}`} className="flex flex-col items-center gap-1.5 shrink-0 w-20">
                                    <div className={`relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-green-500 ${active ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-[#161d15]' : ''}`}>
                                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-white text-2xl">{c.icon}</span>
                                        <img src={c.image} alt={t(c.titleKey)} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="relative w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-[11px] text-center leading-tight font-medium ${active ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>{t(c.titleKey)}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Item cards */}
                {items.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">{t('catalog.noMatch')}</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                                <button onClick={() => setSelected(item)} className="relative h-48 w-full overflow-hidden text-left bg-gray-100 dark:bg-gray-800">
                                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-gray-300 text-5xl">{config.icon}</span>
                                    {/* crop biased upward so people / operators stay in frame */}
                                    <img src={item.image} alt={tc(item.name)} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="relative w-full h-full object-cover object-[center_30%]" />
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="absolute bottom-2 left-2 flex gap-1">
                                            {item.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] font-semibold bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">{tc(tag)}</span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <button onClick={() => setSelected(item)} className="text-left">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{tc(item.name)}</h3>
                                        </button>
                                        <p className="text-lg font-black text-primary whitespace-nowrap">{inr(item.price)}<span className="text-xs font-medium text-gray-400">{tc(serviceUnitLabel[item.unit])}</span></p>
                                    </div>
                                    {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{tc(item.description)}</p>}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-100 dark:border-gray-800">
                                        <span className="text-xs text-gray-400">• {t(config.titleKey)}</span>
                                        <button onClick={() => setSelected(item)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all">
                                            + {t('catalog.add')}
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
                    icon={config.icon}
                    questions={config.questions}
                    quantityLabelKey={config.quantityLabelKey}
                    maxQuantity={config.maxQuantity ?? 10}
                    onClose={() => setSelected(null)}
                    onAdd={(line) => { addLine(line); setSelected(null); }}
                />
            )}

            {/* Floating cart bar */}
            {totalItems > 0 && (
                <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
                    <button
                        onClick={() => router.push('/home/services/cart')}
                        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 active:scale-[0.99] transition-transform"
                    >
                        <span className="flex items-center gap-2 font-bold">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            {totalItems} {t('catalog.itemsWord')}
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
    item, category, icon, questions, quantityLabelKey, maxQuantity, onClose, onAdd,
}: {
    item: ServiceItem;
    category: string;
    icon: string;
    questions: ServiceQuestion[];
    quantityLabelKey?: string;
    maxQuantity: number;
    onClose: () => void;
    onAdd: (line: { category: string; itemId: string; name: string; price: number; unit: ServiceItem['unit']; image: string; quantity: number; answers: Record<string, string> }) => void;
}) {
    const { t, lang } = useLanguage();
    const tc = (s?: string) => translateCatalog(lang, s);
    // Raw text so the user can clear/backspace and type freely.
    const [qtyInput, setQtyInput] = useState('1');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setAnswer = (id: string, val: string) => {
        setAnswers(prev => ({ ...prev, [id]: val }));
        setErrors(prev => { const { [id]: _removed, ...rest } = prev; return rest; });
    };

    // The effective quantity (used for pricing and the cart) is always clamped
    // to [1, maxQuantity], so the total can never exceed the maximum.
    const typedQty = parseInt(qtyInput, 10);
    const hasNumber = !Number.isNaN(typedQty) && typedQty >= 1;
    const exceedsMax = hasNumber && typedQty > maxQuantity;
    const quantity = hasNumber ? Math.min(maxQuantity, typedQty) : 1;

    const commitQty = (n: number) => setQtyInput(String(Math.min(maxQuantity, Math.max(1, n))));

    const handleAdd = () => {
        if (exceedsMax) return;
        const errs: Record<string, string> = {};
        for (const q of questions) {
            if (q.required && !answers[q.id]?.trim()) errs[q.id] = t('catalog.required');
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
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-gray-300 text-5xl">{icon}</span>
                    <img src={item.image} alt={tc(item.name)} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="relative w-full h-full object-cover object-[center_30%] sm:rounded-t-3xl" />
                    <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
                        <span className="material-symbols-outlined text-gray-700">close</span>
                    </button>
                </div>
                <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tc(item.name)}</h2>

                    <div className="mt-3 flex items-center justify-between bg-primary/10 rounded-2xl px-4 py-3">
                        <span className="text-primary font-medium">{t('catalog.amount')}</span>
                        <span className="text-xl font-black text-primary">{inr(item.price)}<span className="text-xs font-medium text-gray-400">{tc(serviceUnitLabel[item.unit])}</span></span>
                    </div>

                    {/* Quantity */}
                    <div className="mt-5">
                        <p className="font-bold text-gray-900 dark:text-white mb-2">{t(quantityLabelKey ?? 'catalog.quantity')}</p>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => commitQty(quantity - 1)}
                                disabled={quantity <= 1}
                                className="w-11 h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Decrease quantity"
                            >
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={qtyInput}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    if (raw === '' || /^\d+$/.test(raw)) setQtyInput(raw);
                                }}
                                onBlur={() => {
                                    const n = parseInt(qtyInput, 10);
                                    if (Number.isNaN(n) || n < 1) setQtyInput('1');
                                    else if (n > maxQuantity) setQtyInput(String(maxQuantity));
                                }}
                                className={`w-24 h-11 text-center rounded-xl bg-gray-50 dark:bg-gray-800 border-2 outline-none font-bold text-gray-900 dark:text-white ${exceedsMax ? 'border-red-400' : 'border-transparent focus:border-primary'}`}
                            />
                            <button
                                type="button"
                                onClick={() => commitQty(quantity + 1)}
                                disabled={quantity >= maxQuantity}
                                className="w-11 h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                        {exceedsMax ? (
                            <p className="text-xs text-red-500 font-semibold mt-2">{t('catalog.maxQuantityIs')} {maxQuantity}. {t('catalog.reduceQuantity')}</p>
                        ) : (
                            <p className="text-xs text-gray-400 mt-2">{t('catalog.maximumQuantity')}: {maxQuantity}</p>
                        )}
                    </div>

                    {/* Questions */}
                    {questions.length > 0 && (
                        <div className="mt-5 space-y-4">
                            {questions.map((q) => (
                                <div key={q.id}>
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                                        {tc(q.label)}{q.required && <span className="text-red-500"> *</span>}
                                    </label>
                                    {q.type === 'select' ? (
                                        <div className="flex flex-wrap gap-2">
                                            {q.options?.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setAnswer(q.id, opt)}
                                                    className={`px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all ${answers[q.id] === opt ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                                                >
                                                    {tc(opt)}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type={q.type === 'number' ? 'number' : 'text'}
                                            value={answers[q.id] ?? ''}
                                            onChange={(e) => setAnswer(q.id, e.target.value)}
                                            placeholder={tc(q.placeholder)}
                                            className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${errors[q.id] ? 'border-red-400' : 'border-transparent'} focus:border-primary outline-none text-sm`}
                                        />
                                    )}
                                    {errors[q.id] && <p className="text-red-500 text-xs mt-1">{errors[q.id]}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleAdd}
                        disabled={exceedsMax}
                        className="w-full mt-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exceedsMax ? `${t('catalog.maxIsShort')} ${maxQuantity}` : `${t('catalog.addToCart')} · ${inr(item.price * quantity)}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
