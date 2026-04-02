'use client';

import { useRef, useState } from 'react';

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (image: string) => void;
}

export default function CreateStoryModal({ isOpen, onClose, onSubmit }: CreateStoryModalProps) {
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed for stories.');
            e.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Story image must be under 10MB.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setImage(ev.target.result as string);
            }
        };
        reader.onerror = () => setError('Failed to read image. Please try another file.');
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handlePostStory = () => {
        if (!image) {
            setError('Please choose an image to post your story.');
            return;
        }

        onSubmit(image);
        setImage(null);
        setError(null);
    };

    const handleClose = () => {
        setImage(null);
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
                    {!image ? (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="w-full min-h-[280px] rounded-2xl border-2 border-dashed border-[#22c33d]/40 bg-[#22c33d]/5 hover:bg-[#22c33d]/10 transition-colors flex flex-col items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-5xl text-[#22c33d]">add_photo_alternate</span>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Upload story photo</p>
                            <p className="text-xs text-gray-500">Tap to choose image</p>
                        </button>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden bg-black">
                            <img src={image} alt="Story preview" className="w-full h-[420px] object-cover" />
                            <button
                                onClick={() => setImage(null)}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
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
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            {image ? 'Change Photo' : 'Select Photo'}
                        </button>
                        <button
                            onClick={handlePostStory}
                            className="flex-1 py-2.5 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 disabled:opacity-50"
                            disabled={!image}
                        >
                            Post Story
                        </button>
                    </div>
                </div>

                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
        </div>
    );
}
