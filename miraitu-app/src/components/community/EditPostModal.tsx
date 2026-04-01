'use client';

import { useState, useRef, useEffect } from 'react';
import { Post } from './types';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 50 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setVideo(ev.target.result as string);
      }
    };
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

  const handleSave = () => {
    if (!content.trim()) return;
    const autoTags = extractHashtags(content);
    const allTags = [...new Set([...tags, ...autoTags])];
    onSave(post.id, { content: content.trim(), images, video, tags: allTags });
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
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Edit Post</h3>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-5 py-2 rounded-full bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
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
                onClick={() => setVideo(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
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
