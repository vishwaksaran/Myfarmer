'use client';

import { useState } from 'react';
import Link from 'next/link';

const loanTypes = [
    { id: 'vehicle', name: 'Vehicle Loan', icon: 'agriculture', rate: '7.5%', max: '₹25 Lakh' },
    { id: 'crop', name: 'Crop Loan', icon: 'grass', rate: '4%', max: '₹5 Lakh' },
    { id: 'land', name: 'Land Development', icon: 'landscape', rate: '8.5%', max: '₹50 Lakh' },
    { id: 'equipment', name: 'Equipment Loan', icon: 'precision_manufacturing', rate: '6.5%', max: '₹10 Lakh' },
    { id: 'dairy', name: 'Dairy Loan', icon: 'pets', rate: '5.5%', max: '₹20 Lakh' },
    { id: 'warehouse', name: 'Warehouse Loan', icon: 'warehouse', rate: '9%', max: '₹1 Crore' },
];

export default function LoanPage() {
    const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ amount: '', purpose: '', name: '', phone: '', aadhar: '', pan: '' });

    const loan = loanTypes.find(l => l.id === selectedLoan);

    if (selectedLoan && step > 0) {
        return (
            <div className="px-6 max-w-4xl mx-auto">
                <button onClick={() => { setStep(0); setSelectedLoan(null); }} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6">
                    <span className="material-symbols-outlined">arrow_back</span> Back
                </button>

                <div className="skeuo-card rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-primary mb-6">Apply for {loan?.name}</h2>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Loan Amount</label>
                                <input type="text" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                    placeholder="₹ Enter amount" className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-xl font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Purpose</label>
                                <textarea value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                                    placeholder="Describe how you'll use this loan..." rows={3} className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none resize-none" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Your name" className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone</label>
                                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Aadhar Number</label>
                                <input type="text" value={form.aadhar} onChange={e => setForm(p => ({ ...p, aadhar: e.target.value }))}
                                    placeholder="XXXX XXXX XXXX" className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">PAN Number</label>
                                <input type="text" value={form.pan} onChange={e => setForm(p => ({ ...p, pan: e.target.value }))}
                                    placeholder="ABCDE1234F" className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Application Submitted!</h3>
                            <p className="text-gray-500">Our team will contact you within 24 hours.</p>
                        </div>
                    )}

                    {step < 3 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold">Back</button>}
                            {step === 1 && <div />}
                            <button onClick={() => setStep(s => s + 1)} className="px-8 py-3 rounded-xl bg-primary text-white font-semibold">
                                {step === 2 ? 'Submit Application' : 'Next'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/home/finance" className="hover:text-primary">Finance</Link>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-white font-medium">Loan</span>
                </div>

                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-3 mb-3">Agricultural <span className="text-primary">Loans</span></h1>
                    <p className="text-lg text-gray-500 max-w-2xl">Choose from our range of specially designed agricultural loans.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loanTypes.map((l) => (
                        <button key={l.id} onClick={() => { setSelectedLoan(l.id); setStep(1); }}
                            className="group text-left p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl">{l.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{l.name}</h3>
                            <div className="space-y-1 text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between"><span className="text-gray-500">Interest</span><span className="font-semibold text-primary">{l.rate} p.a.</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Max</span><span className="font-semibold">{l.max}</span></div>
                            </div>
                            <div className="mt-4 flex items-center text-primary font-semibold">Apply Now <span className="material-symbols-outlined ml-1 group-hover:translate-x-2 transition-transform">arrow_forward</span></div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
