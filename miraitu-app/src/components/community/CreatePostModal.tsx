'use client';

import { useState, useRef, useEffect } from 'react';
import { DEFAULT_COMMUNITY_AVATAR, resolveAvatarSrc } from './avatarUtils';
import { COMMUNITY_FALLBACK_NAME } from './types';
import { discardCommunityMedia, uploadCommunityMedia } from '@/lib/community-media';

/** Which composer the user picked from the create menu, so the modal can open ready for it. */
export type CreatePostIntent = 'post' | 'photo' | 'video' | 'poll';

/** Everything the composer produces. The parent persists it and reports back. */
export interface CreatePostPayload {
  content: string;
  images: string[];
  video: string | null;
  tags: string[];
  location: string;
  pollOptions: string[];
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Resolves once the post has actually been written. The composer stays open
   * with the draft intact when this reports a failure, so nothing is ever lost
   * to a dropped request.
   */
  onSubmit: (post: CreatePostPayload) => Promise<{ success: boolean; error?: string }>;
  userAvatar?: string | null;
  userName?: string | null;
  /** Auto-opens the matching picker/panel when the modal opens. */
  intent?: CreatePostIntent;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit, userAvatar, userName, intent = 'post' }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [video, setVideo] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>([]);
  // Poll intent opens the panel straight away. The parent keys this component by
  // intent, so a remount re-applies this initial value.
  const [showPollInput, setShowPollInput] = useState(intent === 'poll');
  const [pollOptionInput, setPollOptionInput] = useState('');
  const [activeTab, setActiveTab] = useState<'post' | 'image' | 'video'>('post');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  /**
   * Public URL → storage path for everything this composer uploaded. Anything
   * still here when the composer is abandoned gets deleted, so a draft the user
   * walked away from never leaves orphan blobs in the bucket.
   */
  const mediaPathsRef = useRef<Map<string, string>>(new Map());

  /** Drops one uploaded file from the draft and from storage. */
  const forgetMedia = (url: string) => {
    const path = mediaPathsRef.current.get(url);
    if (!path) return;
    mediaPathsRef.current.delete(url);
    void discardCommunityMedia([path]);
  };

  // Jump straight to the picker the user chose in the create menu. Runs on open
  // only — reopening with the same intent re-triggers because isOpen toggled.
  useEffect(() => {
    if (!isOpen) return;
    if (intent === 'photo') fileInputRef.current?.click();
    else if (intent === 'video') videoInputRef.current?.click();
  }, [isOpen, intent]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const picked = Array.from(files);
    e.target.value = ''; // let the same file be re-picked after a failure
    setUploadError(null);
    // Uploaded immediately to storage. A data URL would only ever exist in this
    // browser, so other users could never see the photo.
    void (async () => {
      setUploading(true);
      for (const file of picked) {
        const { media, error } = await uploadCommunityMedia(file, 'image');
        if (media) {
          mediaPathsRef.current.set(media.url, media.path);
          setImages(prev => [...prev, media.url]);
        } else {
          setUploadError(error || 'Upload failed. Please try again.');
        }
      }
      setUploading(false);
    })();
    setActiveTab('image');
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setUploadError(null);
    if (!file) return;
    // Straight to storage, not through FileReader. A base64 data URL could
    // never be published: the Server Action that saves the post caps its
    // request body at 1 MB, which no real video clears.
    void (async () => {
      setUploading(true);
      const { media, error } = await uploadCommunityMedia(file, 'video');
      if (media) {
        // One video per post — replacing it removes the previous upload.
        setVideo(prev => {
          if (prev) forgetMedia(prev);
          return media.url;
        });
        mediaPathsRef.current.set(media.url, media.path);
        setActiveTab('video');
      } else {
        setUploadError(error || 'Upload failed. Please try again.');
      }
      setUploading(false);
    })();
  };

  const handleAddTag = () => {
    let tag = tagInput.trim();
    if (!tag) return;
    if (!tag.startsWith('#')) tag = '#' + tag;
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleRemoveImage = (index: number) => {
    const url = images[index];
    setImages(prev => prev.filter((_, i) => i !== index));
    forgetMedia(url);
  };

  const handleRemoveVideo = () => {
    if (video) forgetMedia(video);
    setVideo(null);
  };

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g);
    return matches || [];
  };

  /** A poll option typed but not yet added counts — losing it to a stray Enter was too easy. */
  const effectivePollOptions = (() => {
    const pending = pollOptionInput.trim();
    if (!showPollInput) return [];
    if (!pending || pollOptions.length >= 4 || pollOptions.includes(pending)) return pollOptions;
    return [...pollOptions, pending];
  })();

  const hasSomethingToPost =
    !!content.trim() || images.length > 0 || !!video || effectivePollOptions.length >= 2;

  const handleSubmit = async () => {
    // Media-only and poll-only posts are valid. The old guard returned early on
    // empty text, so tapping Post on a photo or a poll did nothing at all.
    if (!hasSomethingToPost || uploading || posting) return;
    if (effectivePollOptions.length === 1) {
      setUploadError('A poll needs at least two options');
      return;
    }

    const autoTags = extractHashtags(content);
    const allTags = [...new Set([...tags, ...autoTags])];

    setPosting(true);
    setUploadError(null);
    const result = await onSubmit({
      content: content.trim(),
      images,
      video,
      tags: allTags,
      location: location.trim(),
      pollOptions: effectivePollOptions,
    });
    setPosting(false);

    if (!result.success) {
      // Keep the draft and the uploaded media exactly as they are so the user
      // can just tap Post again.
      setUploadError(result.error || 'Could not publish your post');
      return;
    }

    // Published: the post row now owns this media, so it must not be cleaned up.
    mediaPathsRef.current.clear();
    setContent('');
    setImages([]);
    setVideo(null);
    setTags([]);
    setTagInput('');
    setLocation('');
    setShowLocationInput(false);
    setPollOptions([]);
    setShowPollInput(false);
    setPollOptionInput('');
    setUploadError(null);
    onClose();
  };

  /**
   * Closing without publishing throws the draft away, media included. The
   * component is hidden rather than unmounted, so the state has to be reset
   * explicitly — otherwise reopening would show photos whose files were just
   * deleted from storage.
   */
  const handleClose = () => {
    if (posting) return;
    const orphans = [...mediaPathsRef.current.values()];
    mediaPathsRef.current.clear();
    void discardCommunityMedia(orphans);

    setContent('');
    setImages([]);
    setVideo(null);
    setTags([]);
    setTagInput('');
    setLocation('');
    setShowLocationInput(false);
    setPollOptions([]);
    setPollOptionInput('');
    setUploadError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a231a] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Create Post</h3>
          <button
            onClick={() => { void handleSubmit(); }}
            disabled={uploading || posting || !hasSomethingToPost}
            className="px-5 py-2 rounded-full bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : posting ? 'Posting…' : 'Post'}
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 px-4 pt-4">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
            <img
              src={resolveAvatarSrc(userAvatar, userName || COMMUNITY_FALLBACK_NAME)}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                img.onerror = null;
                img.src = DEFAULT_COMMUNITY_AVATAR;
              }}
            />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{userName || COMMUNITY_FALLBACK_NAME}</p>
            <button className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-xs">public</span>
              Everyone
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your farming experience, tips, or ask a question..."
            className="w-full min-h-[120px] bg-transparent text-gray-900 dark:text-white text-base placeholder:text-gray-400 resize-none border-0 outline-none focus:ring-0"
            autoFocus
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22c33d]/10 text-[#22c33d] text-xs font-semibold">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag Input */}
          {showTagInput && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Add hashtag..."
                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm border-0 outline-none focus:ring-2 focus:ring-[#22c33d]/30"
              />
              <button onClick={handleAddTag} className="px-3 py-2 rounded-xl bg-[#22c33d] text-white text-xs font-semibold">
                Add
              </button>
            </div>
          )}

          {/* Location Input */}
          {showLocationInput && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-[#22c33d] text-lg">location_on</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location (e.g. Punjab, India)"
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none border-0"
                autoFocus
              />
              {location && (
                <button onClick={() => { setLocation(''); setShowLocationInput(false); }} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          )}

          {/* Poll Options */}
          {showPollInput && (
            <div className="mb-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#22c33d]">poll</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">Poll Options</span>
              </div>
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">{opt}</span>
                  <button onClick={() => setPollOptions(prev => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              {pollOptions.length < 4 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pollOptionInput}
                    onChange={(e) => setPollOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const opt = pollOptionInput.trim();
                        if (opt && pollOptions.length < 4) {
                          setPollOptions(prev => [...prev, opt]);
                          setPollOptionInput('');
                        }
                      }
                    }}
                    placeholder={`Option ${pollOptions.length + 1}...`}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-sm border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                  />
                  <button
                    onClick={() => {
                      const opt = pollOptionInput.trim();
                      if (opt && pollOptions.length < 4) {
                        setPollOptions(prev => [...prev, opt]);
                        setPollOptionInput('');
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-[#22c33d] text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              )}
              <p className={`text-[10px] mt-2 ${effectivePollOptions.length === 1 ? 'text-amber-500 font-semibold' : 'text-gray-400'}`}>
                {effectivePollOptions.length === 1
                  ? 'Add one more option — a poll needs at least two'
                  : 'Add 2 to 4 options'}
              </p>
            </div>
          )}

          {/* Image Previews */}
          {images.length > 0 && (
            <div className={`grid gap-2 mb-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {images.map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Video Preview */}
          {video && (
            <div className="relative rounded-xl overflow-hidden bg-black mb-3">
              <video src={video} className="w-full max-h-[50vh] object-contain mx-auto" controls />
              <button
                onClick={handleRemoveVideo}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-3">
              <span className="material-symbols-outlined text-red-500 text-lg">error</span>
              <span className="text-xs text-red-600 dark:text-red-400 font-medium flex-1">{uploadError}</span>
              <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl transition-colors ${activeTab === 'image' ? 'bg-[#22c33d]/10 text-[#22c33d]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Add photos"
              >
                <span className="material-symbols-outlined">image</span>
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className={`p-2.5 rounded-xl transition-colors ${activeTab === 'video' ? 'bg-[#22c33d]/10 text-[#22c33d]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Add video"
              >
                <span className="material-symbols-outlined">videocam</span>
              </button>
              <button
                onClick={() => setShowTagInput(!showTagInput)}
                className={`p-2.5 rounded-xl transition-colors ${showTagInput ? 'bg-[#22c33d]/10 text-[#22c33d]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Add hashtags"
              >
                <span className="material-symbols-outlined">tag</span>
              </button>
              <button
                onClick={() => setShowLocationInput(!showLocationInput)}
                className={`p-2.5 rounded-xl transition-colors ${showLocationInput || location ? 'bg-[#22c33d]/10 text-[#22c33d]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Add location"
              >
                <span className="material-symbols-outlined">location_on</span>
              </button>
              <button
                onClick={() => setShowPollInput(!showPollInput)}
                className={`p-2.5 rounded-xl transition-colors ${showPollInput || pollOptions.length > 0 ? 'bg-[#22c33d]/10 text-[#22c33d]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Create poll"
              >
                <span className="material-symbols-outlined">poll</span>
              </button>
            </div>
            <span className={`text-xs font-medium ${content.length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>
              {content.length}/2000
            </span>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
      </div>
    </div>
  );
}
