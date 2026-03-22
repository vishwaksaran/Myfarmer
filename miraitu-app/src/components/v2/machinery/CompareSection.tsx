'use client';

interface CompareSectionItem {
    id: number;
    name: string;
    category: string;
    specs: string;
    price: string;
    image: string;
    brand: string;
    hp?: string;
    [key: string]: unknown;
}

interface CompareSectionProps {
    /** Items currently in compare slots (max 3) */
    items: (CompareSectionItem | null)[];
    /** Called when user clicks remove on a filled slot */
    onRemove: (index: number) => void;
    /** Called when user clicks the "Compare Now" button */
    onCompare: () => void;
}

export default function CompareSection({ items, onRemove, onCompare }: CompareSectionProps) {
    // Pad to always show 3 slots
    const slots: (CompareSectionItem | null)[] = [
        items[0] ?? null,
        items[1] ?? null,
        items[2] ?? null,
    ];

    const filledCount = slots.filter(Boolean).length;

    return (
        <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">compare_arrows</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compare Selected Models</h2>
                {filledCount > 0 && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {filledCount}/3
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slots.map((slot, index) => (
                    <div
                        key={index}
                        className={`relative rounded-2xl border-2 border-dashed transition-all ${slot
                            ? 'border-primary/30 bg-white dark:bg-[#1a231a]'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                            }`}
                    >
                        {slot ? (
                            <div className="p-4">
                                {/* Remove Button */}
                                <button
                                    onClick={() => onRemove(index)}
                                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 transition-colors flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>

                                <div className="flex gap-4">
                                    {/* Image */}
                                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 overflow-hidden shrink-0">
                                        <img
                                            src={slot.image}
                                            alt={slot.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded mb-1">
                                            {slot.category}
                                        </span>
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                                            {slot.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-2">{slot.brand}</p>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {slot.hp && (
                                                <div>
                                                    <span className="text-gray-400">POWER</span>
                                                    <p className="font-semibold text-gray-700 dark:text-gray-200">{slot.hp} HP</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-gray-400">PRICE</span>
                                                <p className="font-semibold text-primary">{slot.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 flex flex-col items-center justify-center min-h-[140px]">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined text-primary text-2xl">add</span>
                                </div>
                                <p className="text-sm text-gray-500">Slot {index + 1}: Add Model</p>
                                <p className="text-xs text-gray-400 mt-1">Select from list below</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Launch Comparison Button */}
            {filledCount >= 2 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={onCompare}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">compare_arrows</span>
                        Compare Now ({filledCount} models)
                    </button>
                </div>
            )}
        </div>
    );
}
