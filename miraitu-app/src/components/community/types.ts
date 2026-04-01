// Community feature types

export type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful' | 'funny' | 'growth';

export const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Like' },
  love: { emoji: '❤️', label: 'Love' },
  celebrate: { emoji: '👏', label: 'Celebrate' },
  insightful: { emoji: '💡', label: 'Insightful' },
  funny: { emoji: '😂', label: 'Funny' },
  growth: { emoji: '🌱', label: 'Growth' },
};

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
