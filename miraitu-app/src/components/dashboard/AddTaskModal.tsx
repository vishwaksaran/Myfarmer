'use client';

import { useState } from 'react';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
    const [taskName, setTaskName] = useState('');
    const [category, setCategory] = useState('Irrigation');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('low');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log({ taskName, category, dueDate, priority });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 flex justify-between items-start">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="size-12 md:size-14 rounded-2xl bg-gradient-to-br from-primary to-[#4d8f43] flex items-center justify-center shadow-lg text-white">
                            <span className="material-symbols-outlined text-2xl md:text-3xl">add_task</span>
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-primary-dark tracking-tight">Create New Task</h2>
                            <p className="text-xs md:text-sm font-semibold text-gray-500">Plan your farming activities</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-6 md:pb-8 space-y-5 md:space-y-6">
                    {/* Task Name */}
                    <div className="space-y-2">
                        <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider px-1">
                            Task Name
                        </label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="e.g. Irrigate North Wheat Patch"
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-primary-dark font-semibold placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        />
                    </div>

                    {/* Category and Due Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider px-1">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-primary-dark font-semibold appearance-none cursor-pointer focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                >
                                    <option>Irrigation</option>
                                    <option>Fertilizer</option>
                                    <option>Harvesting</option>
                                    <option>Pest Control</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                    expand_more
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider px-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-primary-dark font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Priority Level */}
                    <div className="space-y-3">
                        <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider px-1">
                            Priority Level
                        </label>
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="priority"
                                    value="low"
                                    checked={priority === 'low'}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="hidden peer"
                                />
                                <div className="flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 peer-checked:border-lime-accent peer-checked:bg-lime-accent/10 transition-all">
                                    <span className="material-symbols-outlined text-green-600 mb-1 text-xl md:text-2xl">low_priority</span>
                                    <span className="text-xs font-bold uppercase text-gray-700">Low</span>
                                </div>
                            </label>
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="priority"
                                    value="medium"
                                    checked={priority === 'medium'}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="hidden peer"
                                />
                                <div className="flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 peer-checked:border-orange-400 peer-checked:bg-orange-50 transition-all">
                                    <span className="material-symbols-outlined text-orange-400 mb-1 text-xl md:text-2xl">priority_high</span>
                                    <span className="text-xs font-bold uppercase text-gray-700">Medium</span>
                                </div>
                            </label>
                            <label className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="priority"
                                    value="urgent"
                                    checked={priority === 'urgent'}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="hidden peer"
                                />
                                <div className="flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 peer-checked:border-red-500 peer-checked:bg-red-50 transition-all">
                                    <span className="material-symbols-outlined text-red-500 mb-1 text-xl md:text-2xl">warning</span>
                                    <span className="text-xs font-bold uppercase text-gray-700">Urgent</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="pt-4 md:pt-6 flex flex-col md:flex-row gap-3 md:gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl font-extrabold bg-gradient-to-b from-white to-gray-100 text-gray-700 shadow-[0_4px_0_0_#d1d1d1,0_8px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_0_#d1d1d1,0_4px_10px_rgba(0,0,0,0.1)] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">cancel</span>
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 rounded-2xl font-extrabold bg-gradient-to-b from-[#4d8f43] to-primary text-white shadow-[0_4px_0_0_#1a3617,0_8px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_#1a3617,0_4px_10px_rgba(0,0,0,0.2)] active:translate-y-1 transition-all flex items-center justify-center gap-2 text-base md:text-lg tracking-wide"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            SAVE TASK
                        </button>
                    </div>
                </form>

                {/* Bottom Accent */}
                <div className="h-2 w-full bg-gradient-to-r from-primary/20 via-lime-accent/40 to-primary/20"></div>
            </div>
        </div>
    );
}
