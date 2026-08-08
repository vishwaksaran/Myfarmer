'use client';

import { useState, useRef } from 'react';

/** Uploads a post image to the shared bucket and returns its public URL. */
async function uploadCommunityImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', 'community');
  try {
    const res = await fetch('/api/upload/lease-photo', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url ?? null;
  } catch {
    return null;
  }
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: { content: string; images: string[]; video: string | null; tags: string[] }) => void;
  userAvatar?: string | null;
  userName?: string | null;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit, userAvatar, userName }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [video, setVideo] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>([]);
  const [showPollInput, setShowPollInput] = useState(false);
  const [pollOptionInput, setPollOptionInput] = useState('');
  const [activeTab, setActiveTab] = useState<'post' | 'image' | 'video'>('post');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadError(null);
    // Uploaded immediately to storage. A data URL would only ever exist in this
    // browser, so other users could never see the photo.
    void (async () => {
      setUploading(true);
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be under 5MB'); continue; }
        if (!file.type.startsWith('image/')) { setUploadError('Only image files are allowed'); continue; }
        const url = await uploadCommunityImage(file);
        if (url) setImages(prev => [...prev, url]);
        else setUploadError('Upload failed. Please try again.');
      }
      setUploading(false);
    })();
    setActiveTab('image');
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setUploadError('Only video files are allowed');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError(`Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 50MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setVideo(ev.target.result as string);
        setActiveTab('video');
      }
    };
    reader.onerror = () => setUploadError('Failed to process video. Please try a different file.');
    reader.readAsDataURL(file);
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
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#\w+/g);
    return matches || [];
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    const autoTags = extractHashtags(content);
    const allTags = [...new Set([...tags, ...autoTags])];
    onSubmit({ content: content.trim(), images, video, tags: allTags });
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a231a] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Create Post</h3>
          <button
            onClick={handleSubmit}
            disabled={uploading || (!content.trim() && images.length === 0 && !video)}
            className="px-5 py-2 rounded-full bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : 'Post'}
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
              <p className="text-[10px] text-gray-400 mt-2">Add up to 4 options</p>
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
                onClick={() => setVideo(null)}
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
