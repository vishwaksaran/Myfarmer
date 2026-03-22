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
    /** Called when user clicks an empty slot to add a model */
    onSlotClick?: () => void;
}

export default function CompareSection({ items, onRemove, onCompare, onSlotClick }: CompareSectionProps) {
    // Pad to always show 3 slots
    const slots: (CompareSectionItem | null)[] = [
        items[0] ?? null,
        items[1] ?? null,
        items[2] ?? null,
    ];

    const filledCount = slots.filter(Boolean).length;

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">compare_arrows</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Compare Models</h2>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {filledCount}/3
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((slot, index) => (
                    <div
                        key={index}
                        className={`relative rounded-xl border-2 border-dashed transition-all ${slot
                            ? 'border-primary/30 bg-white dark:bg-[#1a231a]'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]'
                            }`}
                        onClick={!slot && onSlotClick ? onSlotClick : undefined}
                    >
                        {slot ? (
                            <div className="p-3">
                                {/* Remove Button */}
                                <button
                                    onClick={() => onRemove(index)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 transition-colors flex items-center justify-center z-10"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>

                                {/* Image */}
                                <div className="w-full h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 overflow-hidden mb-2">
                                    <img
                                        src={slot.image}
                                        alt={slot.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details */}
                                <h4 className="font-bold text-gray-900 dark:text-white truncate text-xs">
                                    {slot.name}
                                </h4>
                                <p className="text-[10px] text-gray-500">{slot.brand}</p>
                                <div className="flex items-center justify-between mt-1">
                                    {slot.hp && (
                                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{slot.hp} HP</span>
                                    )}
                                    <span className="text-[10px] font-semibold text-primary">{slot.price}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 flex flex-col items-center justify-center min-h-[120px]">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
                                    <span className="material-symbols-outlined text-primary text-xl">add</span>
                                </div>
                                <p className="text-xs font-medium text-gray-500">Add Model</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Tap to select</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Launch Comparison Button */}
            {filledCount >= 2 && (
                <div className="mt-3 text-center">
                    <button
                        onClick={onCompare}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">compare_arrows</span>
                        Compare Now ({filledCount} models)
                    </button>
                </div>
            )}
        </div>
    );
}
