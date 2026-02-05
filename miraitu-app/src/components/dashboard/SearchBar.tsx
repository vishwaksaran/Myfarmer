'use client';

import { useState } from 'react';

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="relative w-full mb-6">
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#fbfaf9] shadow-[inset_4px_4px_8px_#d4d9ce,inset_-4px_-4px_8px_#ffffff] border border-[#e0e5df]/50">
                {/* Search Icon */}
                <span className="material-symbols-outlined text-xl text-soil-dark/60">search</span>

                {/* Input */}
                <input
                    type="text"
                    placeholder="Search for services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-primary-dark placeholder:text-soil-dark/50 font-medium"
                />
            </div>
        </div>
    );
}
