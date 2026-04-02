'use client';

import { useState, useRef, useEffect } from 'react';
import { Post, Comment, ReactionType, REACTION_EMOJIS } from './types';
import { resolveAvatarSrc } from './avatarUtils';

interface PostCardProps {
  post: Post;
  onReact: (postId: string, reaction: ReactionType) => void;
  onComment: (postId: string, text: string, parentId?: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  onTagClick: (tag: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  isFollowingAuthor?: boolean;
  onToggleFollowAuthor?: (username: string) => void;
  onAuthorClick?: (username: string) => void;
  userAvatar?: string | null;
  requireAuth: (action: () => void) => void;
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function ReactionPicker({ onSelect, currentReaction }: { onSelect: (r: ReactionType) => void; currentReaction: ReactionType | null | undefined }) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 bg-white dark:bg-[#222c22] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {(Object.entries(REACTION_EMOJIS) as [ReactionType, { emoji: string; label: string }][]).map(([key, { emoji, label }]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`flex flex-col items-center gap-0.5 p-1 sm:p-1.5 rounded-xl transition-all hover:scale-125 hover:bg-gray-100 dark:hover:bg-gray-700 ${currentReaction === key ? 'scale-110 bg-[#22c33d]/10' : ''}`}
          title={label}
        >
          <span className="text-xl sm:text-2xl leading-none">{emoji}</span>
          <span className="text-[8px] sm:text-[9px] font-medium text-gray-500">{label}</span>
        </button>
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  depth,
  onLikeComment,
  onReply,
}: {
  comment: Comment;
  postId: string;
  depth: number;
  onLikeComment: (postId: string, commentId: string) => void;
  onReply: (commentId: string, author: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(depth === 0);

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-2' : ''}`}>
      <div className="flex gap-2 group">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg overflow-hidden">
          <img src={resolveAvatarSrc(comment.avatar, comment.author)} alt={comment.author} className="w-full h-full object-cover object-center" />
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl px-3.5 py-2.5">
            <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.author}</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">{comment.text}</p>
          </div>
          <div className="flex items-center gap-4 mt-1 px-2">
            <span className="text-[11px] text-gray-400">{comment.time}</span>
            <button
              onClick={() => onLikeComment(postId, comment.id)}
              className={`text-[11px] font-bold transition-colors ${comment.liked ? 'text-[#22c33d]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {comment.liked ? 'Liked' : 'Like'} {comment.likes > 0 && `· ${comment.likes}`}
            </button>
            <button
              onClick={() => onReply(comment.id, comment.author)}
              className="text-[11px] font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <>
          {!showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="ml-10 mt-1 text-xs font-bold text-[#22c33d] hover:underline flex items-center gap-1"
            >
              <span className="w-6 h-[1px] bg-gray-300 dark:bg-gray-600" />
              View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
          {showReplies && comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onLikeComment={onLikeComment}
              onReply={onReply}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default function PostCard({ post, onReact, onComment, onShare, onSave, onTagClick, onLikeComment, onEdit, onDelete, isFollowingAuthor = false, onToggleFollowAuthor, onAuthorClick, userAvatar, requireAuth }: PostCardProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [doubleTapReaction, setDoubleTapReaction] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoPausedRef = useRef(false);
  const reactionTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef(0);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Double tap to like
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      requireAuth(() => {
        if (!post.myReaction) onReact(post.id, 'love');
        setDoubleTapReaction(true);
        setTimeout(() => setDoubleTapReaction(false), 1000);
      });
    }
    lastTap.current = now;
  };

  // Long press for reaction picker
  const handleReactionMouseDown = () => {
    reactionTimeout.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 500);
  };

  const handleReactionMouseUp = () => {
    if (reactionTimeout.current) {
      clearTimeout(reactionTimeout.current);
    }
  };

  const handleReactionSelect = (reaction: ReactionType) => {
    requireAuth(() => {
      onReact(post.id, reaction);
      setShowReactionPicker(false);
    });
  };

  const handleQuickLike = () => {
    requireAuth(() => {
      onReact(post.id, post.myReaction ? post.myReaction : 'like');
    });
  };

  const handleSubmitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    requireAuth(() => {
      onComment(post.id, text, replyTo?.id);
      setCommentText('');
      setReplyTo(null);
    });
  };

  const handleReply = (commentId: string, author: string) => {
    requireAuth(() => {
      setReplyTo({ id: commentId, author });
      setShowComments(true);
    });
  };

  // Top reaction emojis to display
  const topReactions = Object.entries(post.reactions)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => REACTION_EMOJIS[key as ReactionType].emoji);

  useEffect(() => {
    const handleClick = () => setShowReactionPicker(false);
    if (showReactionPicker) {
      setTimeout(() => document.addEventListener('click', handleClick), 0);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showReactionPicker]);

  useEffect(() => {
    setVideoError(false);
    setVideoPlaying(false);
  }, [post.id, post.video]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !post.video || post.images?.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !videoEl.paused) {
          videoEl.pause();
          autoPausedRef.current = true;
          setVideoPlaying(false);
          return;
        }

        if (entry.isIntersecting && videoEl.paused && autoPausedRef.current && !document.hidden) {
          videoEl.play().then(() => {
            autoPausedRef.current = false;
            setVideoPlaying(true);
          }).catch(() => {
            // Ignore autoplay rejection and keep paused state.
          });
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(videoEl);

    const handleVisibilityChange = () => {
      if (document.hidden && !videoEl.paused) {
        videoEl.pause();
        autoPausedRef.current = true;
        setVideoPlaying(false);
        return;
      }

      if (!document.hidden && videoEl.paused && autoPausedRef.current) {
        videoEl.play().then(() => {
          autoPausedRef.current = false;
          setVideoPlaying(true);
        }).catch(() => {
          // Ignore autoplay rejection and keep paused state.
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [post.video, post.images]);

  return (
    <article className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Post Header */}
      <div className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
        <button
          onClick={() => onAuthorClick?.(post.username)}
          className="flex-1 min-w-0 flex items-start gap-2 sm:gap-3 text-left"
        >
          <span className="w-11 h-11 rounded-full bg-gradient-to-br from-[#22c33d]/20 to-[#8CDA4F]/10 flex items-center justify-center text-2xl ring-2 ring-[#22c33d]/10 overflow-hidden shrink-0">
            <img src={resolveAvatarSrc(post.avatar, post.author)} alt={post.author} className="w-full h-full object-cover object-center" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-gray-900 dark:text-white text-sm leading-tight whitespace-normal break-words text-left hover:text-[#22c33d] transition-colors">
                {post.author}
              </span>
            {post.verified && (
              <span className="material-symbols-outlined text-[#22c33d] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            )}
            </span>
            <span className="text-xs text-gray-500 flex flex-wrap items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              {post.location}
              <span className="text-gray-300 dark:text-gray-600 mx-0.5">·</span>
              <span className="shrink-0">{post.time}</span>
            </span>
          </span>
        </button>
        {!post.isOwn && onToggleFollowAuthor && (
          <button
            onClick={() => requireAuth(() => onToggleFollowAuthor(post.username))}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowingAuthor
                ? 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'bg-[#22c33d] text-white hover:brightness-110'
              }`}
          >
            {isFollowingAuthor ? 'Following' : 'Follow'}
          </button>
        )}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">more_horiz</span>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#222c22] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              {post.isOwn && onEdit && (
                <button
                  onClick={() => { setShowMenu(false); onEdit(post.id); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Edit Post
                </button>
              )}
              {post.isOwn && onDelete && (
                <button
                  onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Delete Post
                </button>
              )}
              <button
                onClick={() => { setShowMenu(false); onSave(post.id); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">{post.saved ? 'bookmark_remove' : 'bookmark_add'}</span>
                {post.saved ? 'Unsave Post' : 'Save Post'}
              </button>
              <button
                onClick={() => { setShowMenu(false); onShare(post.id); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">share</span>
                Share Post
              </button>
              {!post.isOwn && (
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">flag</span>
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl text-red-500">delete_forever</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Delete Post?</h3>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone. Your post and all its comments will be permanently removed.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); onDelete?.(post.id); }}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-3 sm:px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line break-words">
          {post.content}
        </p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="text-xs text-[#22c33d] font-semibold hover:text-[#1a9e30] hover:underline transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.images && post.images.length > 0 && (
        <div className="relative" onClick={handleDoubleTap}>
          {/* Image carousel */}
          <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <img
              src={post.images[imageIndex]}
              alt="Post"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Double tap heart animation */}
            {doubleTapReaction && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-7xl animate-ping">❤️</span>
              </div>
            )}
          </div>
          {/* Carousel dots */}
          {post.images.length > 1 && (
            <>
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                {imageIndex > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageIndex(i => i - 1); }}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                )}
                <div />
                {imageIndex < post.images.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageIndex(i => i + 1); }}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                )}
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {post.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setImageIndex(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === imageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                  />
                ))}
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
                {imageIndex + 1}/{post.images.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Video */}
      {post.video && !post.images?.length && (
        <div
          className="relative bg-black overflow-hidden"
          onClick={() => {
            if (videoError) return;
            if (videoRef.current) {
              if (videoRef.current.paused) {
                videoRef.current.play();
                autoPausedRef.current = false;
                setVideoPlaying(true);
              } else {
                videoRef.current.pause();
                autoPausedRef.current = false;
                setVideoPlaying(false);
              }
            }
            handleDoubleTap();
          }}
        >
          <video
            ref={videoRef}
            src={post.video}
            className="w-full max-h-[80vh] object-contain mx-auto"
            playsInline
            loop
            preload="metadata"
            onError={() => {
              setVideoError(true);
              setVideoPlaying(false);
            }}
            onEnded={() => setVideoPlaying(false)}
            onPause={() => setVideoPlaying(false)}
            onPlay={() => {
              autoPausedRef.current = false;
              setVideoError(false);
              setVideoPlaying(true);
            }}
          />
          {videoError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white bg-black/80 px-4 text-center">
              <span className="material-symbols-outlined text-4xl">videocam_off</span>
              <p className="text-sm font-semibold">Video unavailable</p>
              <p className="text-xs text-white/70">Could not load this video. Please try another post or upload a different file.</p>
            </div>
          )}
          {/* Play overlay — shown when paused */}
          {!videoPlaying && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-3xl ml-1">play_arrow</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/40 text-white text-xs font-medium flex items-center gap-1 pointer-events-none">
            <span className="material-symbols-outlined text-xs">videocam</span>
            {videoError ? 'Unavailable' : videoPlaying ? 'Playing' : 'Video'}
          </div>
          {doubleTapReaction && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-7xl animate-ping">❤️</span>
            </div>
          )}
        </div>
      )}

      {/* Reaction Summary */}
      <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          {topReactions.length > 0 && (
            <div className="flex -space-x-1">
              {topReactions.map((emoji, i) => (
                <span key={i} className="text-base inline-block">{emoji}</span>
              ))}
            </div>
          )}
          <span className="text-sm text-gray-500 font-medium">{formatCount(post.totalReactions)}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <button onClick={() => setShowComments(!showComments)} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            {post.commentCount} comments
          </button>
          <span>{post.shares} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 sm:px-3 py-1.5 flex items-center border-t border-gray-100 dark:border-gray-800 relative">
        {/* Reaction Picker Popup */}
        {showReactionPicker && (
          <div className="absolute bottom-full left-2 mb-2 z-20" onClick={(e) => e.stopPropagation()}>
            <ReactionPicker onSelect={handleReactionSelect} currentReaction={post.myReaction} />
          </div>
        )}

        <button
          onClick={handleQuickLike}
          onMouseDown={handleReactionMouseDown}
          onMouseUp={handleReactionMouseUp}
          onMouseLeave={handleReactionMouseUp}
          onTouchStart={handleReactionMouseDown}
          onTouchEnd={handleReactionMouseUp}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl transition-all ${post.myReaction
              ? 'text-[#22c33d] bg-[#22c33d]/5 font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          {post.myReaction ? (
            <span className="text-lg sm:text-xl leading-none">{REACTION_EMOJIS[post.myReaction].emoji}</span>
          ) : (
            <span className="material-symbols-outlined text-lg sm:text-xl">thumb_up</span>
          )}
          <span className="text-xs sm:text-sm font-medium">{post.myReaction ? REACTION_EMOJIS[post.myReaction].label : 'Like'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl transition-all ${showComments ? 'text-[#22c33d] bg-[#22c33d]/5' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">chat_bubble</span>
          <span className="text-xs sm:text-sm font-medium">Comment</span>
        </button>

        <button
          onClick={() => onShare(post.id)}
          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">share</span>
          <span className="text-xs sm:text-sm font-medium">Share</span>
        </button>

        <button
          onClick={() => { requireAuth(() => onSave(post.id)); }}
          className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${post.saved ? 'text-[#FF9F1C]' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <span className="material-symbols-outlined text-xl" style={post.saved ? { fontVariationSettings: "'FILL' 1" } : {}}>
            bookmark
          </span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-3 sm:px-4 pb-4">
          {/* Comment List */}
          {post.comments.length > 0 && (
            <div className="pt-3 space-y-3 mb-3">
              {post.comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  depth={0}
                  onLikeComment={onLikeComment}
                  onReply={handleReply}
                />
              ))}
              {post.commentCount > post.comments.length && (
                <button className="text-xs font-bold text-[#22c33d] hover:underline ml-10">
                  View all {post.commentCount} comments
                </button>
              )}
            </div>
          )}

          {/* Comment Input */}
          <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-sm text-primary/60">person</span>
              )}
            </div>
            <div className="flex-1">
              {replyTo && (
                <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                  <span>Replying to <span className="font-bold text-[#22c33d]">@{replyTo.author}</span></span>
                  <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(); }}
                  placeholder={replyTo ? `Reply to ${replyTo.author}...` : 'Write a comment...'}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="p-2.5 rounded-xl bg-[#22c33d] text-white hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
