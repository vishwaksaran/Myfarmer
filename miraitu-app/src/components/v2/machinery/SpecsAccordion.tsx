'use client';

import { useState } from 'react';

interface SpecSectionData {
    title: string;
    icon: string;
    rows: [string, string | number | undefined][];
}

interface SpecsAccordionProps {
    sections: SpecSectionData[];
}

export default function SpecsAccordion({ sections }: SpecsAccordionProps) {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
        <div className="space-y-2">
            {sections.map((section, idx) => {
                const validRows = section.rows.filter(([, v]) => v !== undefined && v !== null && v !== '');
                if (validRows.length === 0) return null;

                const isOpen = openIdx === idx;

                return (
                    <div
                        key={idx}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <button
                            onClick={() => setOpenIdx(isOpen ? null : idx)}
                            className="flex items-center justify-between w-full px-4 py-3 text-left"
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-lg">{section.icon}</span>
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{section.title}</span>
                            </div>
                            <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {isOpen && (
                            <div className="px-4 pb-3 border-t border-gray-50 dark:border-gray-700">
                                <table className="w-full text-sm mt-2">
                                    <tbody>
                                        {validRows.map(([label, value], ri) => (
                                            <tr key={ri} className={ri % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/30' : ''}>
                                                <td className="py-2 px-3 text-gray-500 dark:text-gray-400 w-1/2">{label}</td>
                                                <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">{String(value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
