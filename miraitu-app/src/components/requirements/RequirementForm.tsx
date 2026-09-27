'use client';

import { useEffect, useRef, useState } from 'react';
import {
    REQUIREMENT_CATEGORIES,
    CONDITION_OPTIONS,
    TIMEFRAME_SUGGESTIONS,
    MAX_REQUIREMENT_IMAGES,
} from '@/lib/requirement-options';

/**
 * "Post Your Requirement" — the buyer's half of the marketplace.
 *
 * The homepage used to show a "Sell Your Product" panel here whose Submit
 * button had no handler: it collected photos, a category and a price and
 * then did nothing with any of it. Sellers already have real places to
 * list from (the boards and the seller workspace); what was missing was a
 * way for a buyer to say what they want instead of scrolling hundreds of
 * listings hoping to find it.
 *
 * Nothing here requires an account. Demand is the last thing to gate.
 */
export default function RequirementForm({
    onDone,
    compact = false,
}: {
    /** Called after a successful submission, once the buyer dismisses it. */
    onDone?: () => void;
    /** Tighter spacing for the homepage panel, which shares a column. */
    compact?: boolean;
}) {
    const [category, setCategory] = useState('');
    const [productModel, setProductModel] = useState('');
    const [condition, setCondition] = useState<string>(CONDITION_OPTIONS[0].value);
    const [quantity, setQuantity] = useState('');
    const [budget, setBudget] = useState('');
    const [location, setLocation] = useState('');
    const [neededBy, setNeededBy] = useState('');
    const [notes, setNotes] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    // Object URLs are revoked when the selection changes or the form goes
    // away, or every re-pick leaks one.
    useEffect(() => () => { previews.forEach(URL.revokeObjectURL); }, [previews]);

    const pickFiles = (list: FileList | null) => {
        if (!list) return;
        const picked = Array.from(list).slice(0, MAX_REQUIREMENT_IMAGES);
        previews.forEach(URL.revokeObjectURL);
        setFiles(picked);
        setPreviews(picked.map(f => URL.createObjectURL(f)));
    };

    const removeFile = (i: number) => {
        URL.revokeObjectURL(previews[i]);
        setFiles(prev => prev.filter((_, n) => n !== i));
        setPreviews(prev => prev.filter((_, n) => n !== i));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!category) { setError('Tell us what you are looking for.'); return; }
        if (!fullName.trim()) { setError('Please enter your name.'); return; }
        if (phone.replace(/\D/g, '').length !== 10) { setError('Enter a valid 10-digit mobile number.'); return; }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('category', category);
            fd.append('productModel', productModel);
            fd.append('condition', condition);
            fd.append('quantity', quantity);
            fd.append('budget', budget);
            fd.append('location', location);
            fd.append('neededBy', neededBy);
            fd.append('notes', notes);
            fd.append('fullName', fullName.trim());
            fd.append('phone', phone);
            files.forEach(f => fd.append('images', f));

            const res = await fetch('/api/requirements', { method: 'POST', body: fd });
            const json = await res.json();

            if (!res.ok || json.error) {
                setError(json.error || 'We could not record your requirement. Please try again.');
                setSubmitting(false);
                return;
            }
            setDone(true);
        } catch {
            setError('Could not reach Miraitu. Check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const field =
        'w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#121811] border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary text-gray-900 dark:text-white';
    const label =
        'block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1';

    if (done) {
        return (
            <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1.5">Requirement received</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Miraitu will look for {category.toLowerCase()} matching what you described and
                    call you on {phone}. You do not need to search the listings yourself.
                </p>
                <button
                    onClick={() => { if (onDone) onDone(); else setDone(false); }}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110"
                >
                    Done
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className={compact ? 'space-y-3' : 'space-y-4'}>
            <div>
                <label className={label}>What are you looking for?</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={field}>
                    <option value="">Choose a category</option>
                    {REQUIREMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={label}>Product / model</label>
                    <input value={productModel} onChange={e => setProductModel(e.target.value)}
                        placeholder="e.g. Mahindra 575" className={field} />
                </div>
                <div>
                    <label className={label}>New or used</label>
                    <select value={condition} onChange={e => setCondition(e.target.value)} className={field}>
                        {CONDITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={label}>Quantity</label>
                    <input value={quantity} onChange={e => setQuantity(e.target.value)}
                        placeholder="e.g. 1 unit, 20 bags" className={field} />
                </div>
                <div>
                    <label className={label}>Budget</label>
                    <input value={budget} onChange={e => setBudget(e.target.value)}
                        placeholder="e.g. under ₹5 lakh" className={field} />
                </div>
                <div>
                    <label className={label}>Location</label>
                    <input value={location} onChange={e => setLocation(e.target.value)}
                        placeholder="Village or district" className={field} />
                </div>
                <div>
                    <label className={label}>When do you need it?</label>
                    <input value={neededBy} onChange={e => setNeededBy(e.target.value)}
                        list="requirement-timeframes" placeholder="e.g. within a week" className={field} />
                    <datalist id="requirement-timeframes">
                        {TIMEFRAME_SUGGESTIONS.map(t => <option key={t} value={t} />)}
                    </datalist>
                </div>
            </div>

            {/* Photos — a picture of the part or the produce saves a call. */}
            <div>
                <label className={label}>
                    Photos <span className="text-gray-500 normal-case">(optional, {files.length}/{MAX_REQUIREMENT_IMAGES})</span>
                </label>
                <input
                    ref={fileRef} type="file" accept="image/*" multiple
                    onChange={e => pickFiles(e.target.files)} className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-xl bg-white dark:bg-[#121811] px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary/50 transition-colors text-center"
                >
                    <span className="material-symbols-outlined text-gray-400 text-2xl block">add_photo_alternate</span>
                    <span className="text-xs font-semibold text-gray-500">
                        Add a photo of what you need
                    </span>
                </button>
                {previews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                        {previews.map((src, i) => (
                            <div key={src} className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={`Reference ${i + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                <button type="button" onClick={() => removeFile(i)}
                                    aria-label="Remove photo"
                                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-gray-900 text-white text-xs grid place-items-center">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={label}>Your name</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder="Full name" className={field} />
                </div>
                <div>
                    <label className={label}>Mobile / WhatsApp</label>
                    <input value={phone} inputMode="numeric" maxLength={10}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit number" className={field} />
                </div>
            </div>

            {!compact && (
                <div>
                    <label className={label}>Anything else (optional)</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                        placeholder="Condition, delivery, attachments needed…"
                        className={field + ' resize-none'} />
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
                type="submit" disabled={submitting}
                className="w-full rounded-2xl py-3.5 bg-gradient-to-r from-primary to-lush-green text-white font-black text-base tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
            >
                <span className={`material-symbols-outlined text-xl ${submitting ? 'animate-spin' : ''}`}>
                    {submitting ? 'progress_activity' : 'campaign'}
                </span>
                {submitting ? 'Sending…' : 'Submit Requirement'}
            </button>
            <p className="text-[11px] text-center text-gray-500">
                No account needed. Miraitu finds it and calls you back.
            </p>
        </form>
    );
}
