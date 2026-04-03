'use client';

import { SuggestedUser } from './types';
import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from './avatarUtils';

interface SuggestedUsersProps {
  users: SuggestedUser[];
  onFollow: (username: string) => void;
}

export default function SuggestedUsers({ users, onFollow }: SuggestedUsersProps) {
  return (
    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#22c33d]">person_add</span>
        Suggested for You
      </h4>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.username} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#22c33d]/20 to-[#8CDA4F]/10 flex items-center justify-center text-xl shrink-0 ring-2 ring-[#22c33d]/10 overflow-hidden">
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
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.bio}</p>
              <p className="text-[10px] text-gray-400">{user.followers} followers</p>
            </div>
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
    </div>
  );
}
