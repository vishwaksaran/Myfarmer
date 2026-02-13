'use client';

import { useState } from 'react';
import Link from 'next/link';

const insuranceTypes = [
    { id: 'crop', name: 'Crop Insurance', icon: 'grass', premium: 'From ₹500/acre', coverage: 'Up to ₹2 Lakh' },
    { id: 'livestock', name: 'Livestock Insurance', icon: 'pets', premium: 'From ₹1,000', coverage: 'Up to ₹5 Lakh' },
    { id: 'equipment', name: 'Equipment Insurance', icon: 'precision_manufacturing', premium: 'From ₹2,000', coverage: 'Up to ₹25 Lakh' },
    { id: 'health', name: 'Farmer Health Insurance', icon: 'health_and_safety', premium: 'From ₹500/year', coverage: 'Up to ₹5 Lakh' },
    { id: 'weather', name: 'Weather Insurance', icon: 'thunderstorm', premium: 'From ₹300/acre', coverage: 'Up to ₹1 Lakh' },
    { id: 'storage', name: 'Storage Insurance', icon: 'warehouse', premium: 'From ₹1,500', coverage: 'Up to ₹10 Lakh' },
];

export default function InsurancePage() {
    const [selected, setSelected] = useState<string | null>(null);
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ name: '', phone: '', aadhar: '', landSize: '', cropType: '', animalCount: '' });

    const insurance = insuranceTypes.find(i => i.id === selected);

    if (selected && step > 0) {
        return (
            <div className="px-6 max-w-4xl mx-auto">
                <button onClick={() => { setStep(0); setSelected(null); }} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6">
                    <span className="material-symbols-outlined">arrow_back</span> Back
                </button>

                <div className="skeuo-card rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-primary mb-6">Get {insurance?.name}</h2>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-3xl">{insurance?.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{insurance?.name}</h3>
                                        <p className="text-gray-500">{insurance?.premium} • Coverage: {insurance?.coverage}</p>
                                    </div>
                                </div>
                            </div>

                            {(selected === 'crop' || selected === 'weather') && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Land Size (Acres)</label>
                                        <input type="text" value={form.landSize} onChange={e => setForm(p => ({ ...p, landSize: e.target.value }))}
                                            placeholder="e.g. 5" className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Crop Type</label>
                                        <select value={form.cropType} onChange={e => setForm(p => ({ ...p, cropType: e.target.value }))}
                                            className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none">
                                            <option value="">Select Crop</option>
                                            <option>Rice</option><option>Wheat</option><option>Cotton</option><option>Sugarcane</option><option>Vegetables</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {selected === 'livestock' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Number of Animals</label>
                                    <input type="text" value={form.animalCount} onChange={e => setForm(p => ({ ...p, animalCount: e.target.value }))}
                                        placeholder="e.g. 10" className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" />
                                </div>
                            )}
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
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Aadhar Number</label>
                                <input type="text" value={form.aadhar} onChange={e => setForm(p => ({ ...p, aadhar: e.target.value }))}
                                    placeholder="XXXX XXXX XXXX" className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-emerald-500 text-4xl">verified</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Insurance Application Submitted!</h3>
                            <p className="text-gray-500 mb-4">Your policy will be activated within 48 hours.</p>
                            <div className="inline-block px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold">
                                Estimated Premium: ₹{selected === 'crop' ? (Number(form.landSize || 1) * 500).toLocaleString() : '2,500'}
                            </div>
                        </div>
                    )}

                    {step < 3 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold">Back</button>}
                            {step === 1 && <div />}
                            <button onClick={() => setStep(s => s + 1)} className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">
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
                    <span className="text-gray-900 dark:text-white font-medium">Insurance</span>
                </div>

                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-3 mb-3">Agricultural <span className="text-primary">Insurance</span></h1>
                    <p className="text-lg text-gray-500 max-w-2xl">Protect your crops, livestock, and equipment with comprehensive coverage.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {insuranceTypes.map((i) => (
                        <button key={i.id} onClick={() => { setSelected(i.id); setStep(1); }}
                            className="group text-left p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl">{i.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{i.name}</h3>
                            <div className="space-y-1 text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between"><span className="text-gray-500">Premium</span><span className="font-semibold text-emerald-600">{i.premium}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Coverage</span><span className="font-semibold">{i.coverage}</span></div>
                            </div>
                            <div className="mt-4 flex items-center text-emerald-500 font-semibold">Get Quote <span className="material-symbols-outlined ml-1 group-hover:translate-x-2 transition-transform">arrow_forward</span></div>
                        </button>
                    ))}
                </div>

                {/* PMFBY Banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-3xl">policy</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">PM Fasal Bima Yojana</h2>
                                <p className="text-white/90">Get subsidized crop insurance under government scheme</p>
                            </div>
                        </div>
                        <a
                            href="https://pmfby.gov.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg"
                        >
                            Check Eligibility →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
