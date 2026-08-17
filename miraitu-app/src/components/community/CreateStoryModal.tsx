'use client';

import { useRef, useState } from 'react';
import { discardCommunityMedia, uploadCommunityMedia } from '@/lib/community-media';

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Resolves once the stories are saved. The draft survives a failure. */
    onSubmit: (images: string[]) => Promise<{ success: boolean; error?: string }>;
}

export default function CreateStoryModal({ isOpen, onClose, onSubmit }: CreateStoryModalProps) {
    const [images, setImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [posting, setPosting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    /** Public URL → storage path, so an abandoned draft cleans up after itself. */
    const mediaPathsRef = useRef<Map<string, string>>(new Map());

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        setError(null);
        if (files.length === 0) return;

        // Uploaded to storage up front. The old FileReader path produced base64
        // data URLs that lived only in this browser — nobody else could ever see
        // the story, and it disappeared on refresh.
        void (async () => {
            setUploading(true);
            for (const file of files) {
                const { media, error: uploadError } = await uploadCommunityMedia(file, 'image');
                if (media) {
                    mediaPathsRef.current.set(media.url, media.path);
                    setImages(prev => [...prev, media.url]);
                } else {
                    setError(uploadError || 'Failed to upload one of the images. Please try again.');
                }
            }
            setUploading(false);
        })();
    };

    const handleRemoveImage = (index: number) => {
        const url = images[index];
        setImages(prev => prev.filter((_, i) => i !== index));
        const path = mediaPathsRef.current.get(url);
        if (path) {
            mediaPathsRef.current.delete(url);
            void discardCommunityMedia([path]);
        }
    };

    const handlePostStory = async () => {
        if (uploading || posting) return;
        if (images.length === 0) {
            setError('Please choose at least one image to post your story.');
            return;
        }

        setPosting(true);
        const result = await onSubmit(images);
        setPosting(false);

        if (!result.success) {
            setError(result.error || 'Could not post your story. Please try again.');
            return;
        }

        // Saved: the story rows own this media now.
        mediaPathsRef.current.clear();
        setImages([]);
        setError(null);
    };

    const handleClose = () => {
        if (posting) return;
        const orphans = [...mediaPathsRef.current.values()];
        mediaPathsRef.current.clear();
        void discardCommunityMedia(orphans);
        setImages([]);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Story</h3>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-4">
                    {images.length === 0 ? (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="w-full min-h-[280px] rounded-2xl border-2 border-dashed border-[#22c33d]/40 bg-[#22c33d]/5 hover:bg-[#22c33d]/10 transition-colors flex flex-col items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-5xl text-[#22c33d]">add_photo_alternate</span>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload story photo</p>
                            <p className="text-xs text-gray-500">Tap to choose image</p>
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Selected stories: {images.length}</p>
                            <div className="grid grid-cols-3 gap-2 max-h-[420px] overflow-y-auto">
                                {images.map((image, idx) => (
                                    <div key={`${idx}-${image.slice(0, 24)}`} className="relative rounded-xl overflow-hidden bg-black aspect-[3/4]">
                                        <img src={image} alt={`Story preview ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                                        >
                                            <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-medium text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading || posting}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading…' : images.length > 0 ? 'Add More Photos' : 'Select Photo'}
                        </button>
                        <button
                            onClick={() => { void handlePostStory(); }}
                            className="flex-1 py-2.5 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 disabled:opacity-50"
                            disabled={images.length === 0 || uploading || posting}
                        >
                            {posting ? 'Posting…' : `Post ${images.length > 1 ? `${images.length} Stories` : 'Story'}`}
                        </button>
                    </div>
                </div>

                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>
        </div>
    );
}
