'use client';

import { useState, useEffect } from 'react';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
    'Uttar Pradesh', 'West Bengal',
];

interface CheckPriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    tractorName: string;
}

export default function CheckPriceModal({ isOpen, onClose, tractorName }: CheckPriceModalProps) {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [tehsil, setTehsil] = useState('');
    const [lookingForLoans, setLookingForLoans] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Store the inquiry (could be extended to save to Supabase)
        setSubmitted(true);
    };

    const handleClose = () => {
        setName('');
        setMobile('');
        setState('');
        setDistrict('');
        setTehsil('');
        setLookingForLoans(true);
        setSubmitted(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 rounded-t-2xl">
                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <div className="px-6 py-5">
                    {submitted ? (
                        <div className="text-center py-8">
                            <span className="material-symbols-outlined text-5xl text-emerald-500 mb-3 block">check_circle</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                We&apos;ll share the best price for <strong>{tractorName}</strong> shortly.
                            </p>
                            <button
                                onClick={handleClose}
                                className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {tractorName}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Name & Mobile */}
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Enter Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Enter Mobile Number"
                                        value={mobile}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setMobile(val);
                                        }}
                                        required
                                        pattern="[0-9]{10}"
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* State & District */}
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={state}
                                        onChange={(e) => {
                                            setState(e.target.value);
                                            setDistrict('');
                                            setTehsil('');
                                        }}
                                        required
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none appearance-none"
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Select District"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* Tehsil */}
                                <input
                                    type="text"
                                    placeholder="Select Tehsil"
                                    value={tehsil}
                                    onChange={(e) => setTehsil(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                />

                                {/* Loan checkbox */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={lookingForLoans}
                                        onChange={(e) => setLookingForLoans(e.target.checked)}
                                        className="w-4 h-4 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Also looking for other loans</span>
                                </label>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                >
                                    Check Tractor Price
                                </button>

                                <p className="text-xs text-center text-gray-400">
                                    By proceeding, you confirm and agree to the{' '}
                                    <a href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</a>.
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
