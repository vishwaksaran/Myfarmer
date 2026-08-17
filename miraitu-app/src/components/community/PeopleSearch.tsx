'use client';

import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from './avatarUtils';
import type { DirectoryUser } from './SuggestedUsers';

interface PeopleSearchProps {
    query: string;
    onQueryChange: (value: string) => void;
    /** Results for the current query — already filtered server-side. */
    results: DirectoryUser[];
    loading?: boolean;
    onFollow: (username: string) => void;
    onOpenProfile: (username: string) => void;
}

/**
 * Find-a-farmer search that lives in the main feed column.
 *
 * The only people search used to sit in the right sidebar, which is
 * `hidden xl:block` — so on a phone, where most of this app is used, there was
 * no way to look anyone up at all. Results render inline and only while a
 * query is typed, so the box costs one row when idle.
 */
export default function PeopleSearch({
    query,
    onQueryChange,
    results,
    loading = false,
    onFollow,
    onOpenProfile,
}: PeopleSearchProps) {
    const searching = query.trim().length > 0;

    return (
        <div className="mb-4 sm:mb-5">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800">
                <span className="material-symbols-outlined text-gray-400 text-xl">person_search</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Search farmers by name or @handle…"
                    aria-label="Search people in the community"
                    className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                />
                {searching && (
                    <button
                        onClick={() => onQueryChange('')}
                        aria-label="Clear people search"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                )}
            </div>

            {searching && (
                <div className="mt-2 rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {loading ? (
                        <p className="py-6 text-center text-xs text-gray-400">Searching…</p>
                    ) : results.length === 0 ? (
                        <p className="py-6 text-center text-xs text-gray-400">
                            No one matches &ldquo;{query}&rdquo;
                        </p>
                    ) : (
                        <div className="max-h-[22rem] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60">
                            {results.map(person => (
                                <div key={person.username} className="flex items-center gap-3 px-3 py-2.5">
                                    <button
                                        onClick={() => onOpenProfile(person.username)}
                                        className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-[#22c33d]/20 to-[#8CDA4F]/10 ring-2 ring-[#22c33d]/10"
                                        aria-label={`Open ${person.name}'s profile`}
                                    >
                                        <img
                                            src={resolveAvatarSrc(person.avatar, person.name)}
                                            alt=""
                                            className="w-full h-full object-cover object-center"
                                            onError={(e) => {
                                                const img = e.currentTarget;
                                                img.onerror = null;
                                                img.src = DEFAULT_COMMUNITY_AVATAR;
                                            }}
                                        />
                                    </button>
                                    <button
                                        onClick={() => onOpenProfile(person.username)}
                                        className="flex-1 min-w-0 text-left"
                                    >
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{person.name}</p>
                                        <p className="text-[11px] text-gray-500 truncate">@{person.username}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{person.followers}</p>
                                    </button>
                                    <button
                                        onClick={() => onFollow(person.username)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${person.following
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            : 'bg-[#22c33d] text-white hover:brightness-110'
                                            }`}
                                    >
                                        {person.following ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
