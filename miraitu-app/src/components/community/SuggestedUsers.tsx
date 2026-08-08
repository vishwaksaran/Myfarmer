'use client';

import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from './avatarUtils';

/** Shape shared with `CommunityUser` from the server action, plus follow state. */
export interface DirectoryUser {
    id?: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    followers: string;
    following: boolean;
    location?: string;
    postCount?: number;
}

interface SuggestedUsersProps {
    users: DirectoryUser[];
    onFollow: (username: string) => void;
    /** Opens someone's profile. Omit to keep the rows non-clickable. */
    onOpenProfile?: (username: string) => void;
    /** Search box — omit both to hide it. */
    query?: string;
    onQueryChange?: (value: string) => void;
}

export default function SuggestedUsers({ users, onFollow, onOpenProfile, query, onQueryChange }: SuggestedUsersProps) {
    const searchable = typeof query === 'string' && !!onQueryChange;

    return (
        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#22c33d]">group</span>
                People on Miraitu
            </h4>

            {searchable && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                    <span className="material-symbols-outlined text-gray-400 text-base">search</span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange!(e.target.value)}
                        placeholder="Search farmers by name…"
                        className="flex-1 bg-transparent text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                    />
                    {query && (
                        <button onClick={() => onQueryChange!('')} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    )}
                </div>
            )}

            {users.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">
                    {searchable && query ? `No one matches “${query}”` : 'No other members yet'}
                </p>
            ) : (
                <div className="space-y-3">
                    {users.map((user) => (
                        <div key={user.username} className="flex items-center gap-3">
                            <button
                                onClick={() => onOpenProfile?.(user.username)}
                                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#22c33d]/20 to-[#8CDA4F]/10 flex items-center justify-center text-xl shrink-0 ring-2 ring-[#22c33d]/10 overflow-hidden"
                            >
                                <img
                                    src={resolveAvatarSrc(user.avatar, user.name)}
                                    alt={user.name}
                                    className="w-full h-full object-cover object-center"
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        img.onerror = null;
                                        img.src = DEFAULT_COMMUNITY_AVATAR;
                                    }}
                                />
                            </button>
                            <button
                                onClick={() => onOpenProfile?.(user.username)}
                                className="flex-1 min-w-0 text-left"
                            >
                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-[11px] text-gray-500 truncate">
                                    {user.location ? `${user.bio} · ${user.location}` : user.bio}
                                </p>
                                <p className="text-[10px] text-gray-400">{user.followers}</p>
                            </button>
                            <button
                                onClick={() => onFollow(user.username)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${user.following
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    : 'bg-[#22c33d] text-white hover:brightness-110'
                                    }`}
                            >
                                {user.following ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
