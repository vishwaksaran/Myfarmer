// Community feature types

/**
 * Shown for anyone who has not set a name on their profile.
 *
 * Both the feed (server side) and the composer (client side) must use this one
 * value: when they disagreed, a nameless user saw their own posts signed
 * "Miraitu Farmer" (MF) while the composer above them showed a "Y" avatar
 * seeded from the literal string "you", as if it belonged to someone else.
 */
export const COMMUNITY_FALLBACK_NAME = 'Miraitu Farmer';

export type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful' | 'funny' | 'growth';

export const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string }> = {
  // 'like' is legacy only: it is what rows saved before the feed moved to a
  // heart carry, and what actions/community.ts falls back to for a reaction
  // type it does not recognise. Nothing writes it any more — the heart button
  // and the double-tap both write 'love' — so it renders as a heart to match
  // and is kept out of PICKER_REACTIONS to avoid offering two of them.
  like: { emoji: '❤️', label: 'Like' },
  love: { emoji: '❤️', label: 'Love' },
  celebrate: { emoji: '👏', label: 'Celebrate' },
  insightful: { emoji: '💡', label: 'Insightful' },
  funny: { emoji: '😂', label: 'Funny' },
  growth: { emoji: '🌱', label: 'Growth' },
};

/** What the long-press picker offers, in order. Excludes the legacy 'like'. */
export const PICKER_REACTIONS: ReactionType[] = ['love', 'celebrate', 'insightful', 'funny', 'growth'];

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies?: Comment[];
}

/** One choice on a post's poll, with its live tally. */
export interface PollOption {
  /** Index into the post's stored option list — what a vote refers to. */
  index: number;
  text: string;
  votes: number;
}

export interface Poll {
  options: PollOption[];
  totalVotes: number;
  /** The option the signed-in user picked, or null if they have not voted. */
  myVote: number | null;
}

export interface Post {
  id: string;
  author: string;
  username: string;
  avatar: string;
  verified: boolean;
  location: string;
  time: string;
  content: string;
  images?: string[];
  video?: string;
  poll?: Poll;
  reactions: Record<ReactionType, number>;
  myReaction?: ReactionType | null;
  totalReactions: number;
  comments: Comment[];
  commentCount: number;
  shares: number;
  saved: boolean;
  tags: string[];
  type: 'post' | 'image' | 'video' | 'poll';
  isOwn?: boolean;
}

export interface Story {
  id: string;
  author: string;
  avatar: string;
  image: string;
  seen: boolean;
  isOwn: boolean;
  /** Handle of whoever posted it — used to group and to open their profile. */
  username?: string;
  /** How many people have watched it. Only populated for your own stories. */
  viewCount?: number;
}

export interface NewsEvent {
  id: string;
  title: string;
  source: string;
  image: string;
  url: string;
  date: string;
  category: string;
}

export interface TrendingTopic {
  tag: string;
  posts: string;
  growth: string;
}

export interface SuggestedUser {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: string;
  following: boolean;
}
