'use client';

import { useState, useRef, useEffect } from 'react';
import { Post } from './types';
import { discardCommunityMedia, uploadCommunityMedia } from '@/lib/community-media';
import { Z } from '@/lib/z-layers';

interface EditPostModalProps {
  isOpen: boolean;
  post: Post | null;
  onClose: () => void;
  onSave: (postId: string, data: { content: string; images: string[]; video: string | null; tags: string[] }) => void;
  userAvatar?: string | null;
  userName?: string | null;
}

export default function EditPostModal({ isOpen, post, onClose, onSave, userAvatar, userName }: EditPostModalProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  /** Public URL → storage path for media added during this edit only. */
  const addedPathsRef = useRef<Map<string, string>>(new Map());

  // Populate fields when post changes
  useEffect(() => {
    if (post && isOpen) {
      setContent(post.content);
      setImages(post.images || []);
      setVideo(post.video || null);
      setTags(post.tags);
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  /** Drops a file added in this session from both the draft and storage. */
  const forgetAdded = (url: string) => {
    const path = addedPathsRef.current.get(url);
    if (!path) return; // media that was already on the post — leave it alone
    addedPathsRef.current.delete(url);
    void discardCommunityMedia([path]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploadError(null);
    // Uploaded to storage like the composer does. Data URLs were never
    // persisted: the update rejects them, so photos added while editing
    // reappeared unchanged on the next refresh.
    void (async () => {
      setUploading(true);
      for (const file of files) {
        const { media, error } = await uploadCommunityMedia(file, 'image');
        if (media) {
          addedPathsRef.current.set(media.url, media.path);
          setImages(prev => [...prev, media.url]);
        } else {
          setUploadError(error || 'Upload failed. Please try again.');
        }
      }
      setUploading(false);
    })();
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    void (async () => {
      setUploading(true);
      const { media, error } = await uploadCommunityMedia(file, 'video');
      if (media) {
        setVideo(prev => {
          if (prev) forgetAdded(prev);
          return media.url;
        });
        addedPathsRef.current.set(media.url, media.path);
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
    forgetAdded(url);
  };

  const handleRemoveVideo = () => {
    if (video) forgetAdded(video);
    setVideo(null);
  };

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g);
    return matches || [];
  };

  const handleSave = () => {
    // A post can be media-only, so an empty caption is a valid edit as long as
    // something is left on the post.
    if (uploading) return;
    if (!content.trim() && images.length === 0 && !video) return;
    const autoTags = extractHashtags(content);
    const allTags = [...new Set([...tags, ...autoTags])];
    addedPathsRef.current.clear(); // the post owns this media now
    onSave(post.id, { content: content.trim(), images, video, tags: allTags });
    onClose();
  };

  /** Abandoning the edit removes anything uploaded during it. */
  const handleClose = () => {
    const orphans = [...addedPathsRef.current.values()];
    addedPathsRef.current.clear();
    void discardCommunityMedia(orphans);
    setUploadError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: Z.MODAL }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a231a] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Edit Post</h3>
          <button
            onClick={handleSave}
            disabled={uploading || (!content.trim() && images.length === 0 && !video)}
            className="px-5 py-2 rounded-full bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : 'Save'}
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 px-4 pt-4">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-xl text-primary/60">person</span>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{userName || 'Farmer'}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="material-symbols-outlined text-xs">edit</span>
              Editing post
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit your post..."
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
            <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800 mb-3">
              <video src={video} className="w-full h-full object-cover" controls />
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
                className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Add photos"
              >
                <span className="material-symbols-outlined">image</span>
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
