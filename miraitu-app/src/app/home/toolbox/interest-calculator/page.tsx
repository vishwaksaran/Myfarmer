'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

type LoanType = 'kcc' | 'farm-loan' | 'equipment' | 'custom';

const loanPresets: Record<LoanType, { name: string; rate: number; tenure: number; maxAmount: number; icon: string }> = {
    kcc: { name: 'Kisan Credit Card (KCC)', rate: 4, tenure: 12, maxAmount: 300000, icon: 'credit_card' },
    'farm-loan': { name: 'Farm Development Loan', rate: 8.5, tenure: 60, maxAmount: 1000000, icon: 'agriculture' },
    equipment: { name: 'Equipment / Machinery Loan', rate: 10, tenure: 36, maxAmount: 2000000, icon: 'precision_manufacturing' },
    custom: { name: 'Custom Loan', rate: 9, tenure: 24, maxAmount: 5000000, icon: 'tune' },
};

export default function InterestCalculatorPage() {
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const [loanType, setLoanType] = useState<LoanType>('kcc');
    const [principal, setPrincipal] = useState('100000');
    const [rate, setRate] = useState('4');
    const [tenure, setTenure] = useState('12');
    const [calculated, setCalculated] = useState(false);

    const preset = loanPresets[loanType];

    const handlePresetChange = (type: LoanType) => {
        setLoanType(type);
        setRate(String(loanPresets[type].rate));
        setTenure(String(loanPresets[type].tenure));
        setCalculated(false);
    };

    const P = parseFloat(principal) || 0;
    const R = (parseFloat(rate) || 0) / 100 / 12;
    const N = parseInt(tenure) || 1;

    // EMI = P * R * (1+R)^N / ((1+R)^N - 1)
    const emi = R > 0 ? (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1) : P / N;
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    const schedule = [];
    let balance = P;
    for (let i = 1; i <= Math.min(N, 120); i++) {
        const interestPart = balance * R;
        const principalPart = emi - interestPart;
        balance = Math.max(0, balance - principalPart);
        schedule.push({ month: i, emi, interest: interestPart, principal: principalPart, balance });
    }

    const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-4 md:px-6 pt-6 md:pt-10 pb-12">
                <div className="mx-auto max-w-[1280px]">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">{tp('Home')}</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/toolbox" className="text-gray-500 hover:text-primary font-medium">{tp('Agri Calculators')}</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">{tp('Interest Calculator')}</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">calculate</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">{tp('Interest Calculator')}</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500 ml-0 md:ml-15">{tp('Estimate KCC loans, farm credit interests, and repayment schedules instantly.')}</p>
                    </div>

                    {/* Loan Type Selector */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
                        {(Object.entries(loanPresets) as [LoanType, typeof preset][]).map(([key, val]) => (
                            <button
                                key={key}
                                onClick={() => handlePresetChange(key)}
                                className={`skeuo-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center transition-all ${loanType === key ? 'ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:shadow-md'}`}
                            >
                                <span className={`material-symbols-outlined text-2xl md:text-3xl mb-1 md:mb-2 block ${loanType === key ? 'text-primary' : 'text-gray-400'}`}>{val.icon}</span>
                                <p className={`text-xs md:text-sm font-bold ${loanType === key ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>{tp(val.name)}</p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{val.rate}% {tp('p.a.')}</p>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Input Panel */}
                        <div className="lg:col-span-2">
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8 sticky top-24">
                                <h3 className="text-lg md:text-xl font-black mb-6 text-gray-900 dark:text-white">{tp('Loan Details')}</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tp('Loan Amount (₹)')}</label>
                                        <input
                                            type="number"
                                            value={principal}
                                            onChange={e => { setPrincipal(e.target.value); setCalculated(false); }}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 text-lg font-bold focus:ring-0 border-none"
                                            placeholder="e.g. 100000"
                                            max={preset.maxAmount}
                                        />
                                        <input
                                            type="range"
                                            min="10000" max={preset.maxAmount} step="10000"
                                            value={principal}
                                            onChange={e => { setPrincipal(e.target.value); setCalculated(false); }}
                                            className="w-full mt-2 accent-primary"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                                            <span>₹10K</span>
                                            <span>₹{(preset.maxAmount / 100000).toFixed(0)}L</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tp('Interest Rate (% per annum)')}</label>
                                        <input
                                            type="number"
                                            value={rate}
                                            onChange={e => { setRate(e.target.value); setCalculated(false); }}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 text-lg font-bold focus:ring-0 border-none"
                                            step="0.1" min="0" max="30"
                                        />
                                        <input
                                            type="range"
                                            min="1" max="25" step="0.5"
                                            value={rate}
                                            onChange={e => { setRate(e.target.value); setCalculated(false); }}
                                            className="w-full mt-2 accent-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tp('Tenure (Months)')}</label>
                                        <input
                                            type="number"
                                            value={tenure}
                                            onChange={e => { setTenure(e.target.value); setCalculated(false); }}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 text-lg font-bold focus:ring-0 border-none"
                                            min="1" max="120"
                                        />
                                        <input
                                            type="range"
                                            min="1" max="120" step="1"
                                            value={tenure}
                                            onChange={e => { setTenure(e.target.value); setCalculated(false); }}
                                            className="w-full mt-2 accent-primary"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                                            <span>{tp('1 mo')}</span>
                                            <span>{tp('10 yrs')}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setCalculated(true)}
                                        className="glossy-button w-full rounded-xl py-4 text-white font-black text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                    >
                                        <span className="material-symbols-outlined">calculate</span>
                                        {tp('Calculate EMI')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                <div className="skeuo-card rounded-2xl p-4 md:p-6 text-center">
                                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{tp('Monthly EMI')}</p>
                                    <p className="text-xl md:text-3xl font-black text-primary">{fmt(emi)}</p>
                                </div>
                                <div className="skeuo-card rounded-2xl p-4 md:p-6 text-center">
                                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{tp('Total Interest')}</p>
                                    <p className="text-xl md:text-3xl font-black text-red-500">{fmt(totalInterest)}</p>
                                </div>
                                <div className="skeuo-card rounded-2xl p-4 md:p-6 text-center">
                                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{tp('Total Payment')}</p>
                                    <p className="text-xl md:text-3xl font-black text-gray-900 dark:text-white">{fmt(totalPayment)}</p>
                                </div>
                            </div>

                            {/* Visual Breakdown */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">{tp('Payment Breakdown')}</h4>
                                <div className="flex rounded-full overflow-hidden h-6 md:h-8 mb-4">
                                    <div className="bg-primary" style={{ width: `${(P / totalPayment) * 100}%` }}></div>
                                    <div className="bg-red-400" style={{ width: `${(totalInterest / totalPayment) * 100}%` }}></div>
                                </div>
                                <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                                        <span className="text-gray-600 dark:text-gray-400">{tp('Principal')}: <strong>{fmt(P)}</strong> ({((P / totalPayment) * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <span className="text-gray-600 dark:text-gray-400">{tp('Interest')}: <strong>{fmt(totalInterest)}</strong> ({((totalInterest / totalPayment) * 100).toFixed(1)}%)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Repayment Schedule */}
                            {calculated && (
                                <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">{tp('Repayment Schedule')}</h4>
                                    <div className="overflow-x-auto -mx-2 md:mx-0">
                                        <table className="w-full text-xs md:text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                                    <th className="text-left py-2 md:py-3 px-2 font-bold text-gray-500">{tp('Month')}</th>
                                                    <th className="text-right py-2 md:py-3 px-2 font-bold text-gray-500">EMI</th>
                                                    <th className="text-right py-2 md:py-3 px-2 font-bold text-gray-500">{tp('Principal')}</th>
                                                    <th className="text-right py-2 md:py-3 px-2 font-bold text-gray-500">{tp('Interest')}</th>
                                                    <th className="text-right py-2 md:py-3 px-2 font-bold text-gray-500">{tp('Balance')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schedule.map(row => (
                                                    <tr key={row.month} className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary/5 transition-colors">
                                                        <td className="py-2 px-2 font-bold">{row.month}</td>
                                                        <td className="py-2 px-2 text-right">{fmt(row.emi)}</td>
                                                        <td className="py-2 px-2 text-right text-primary font-medium">{fmt(row.principal)}</td>
                                                        <td className="py-2 px-2 text-right text-red-500 font-medium">{fmt(row.interest)}</td>
                                                        <td className="py-2 px-2 text-right font-bold">{fmt(row.balance)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* KCC Info Box */}
                            {loanType === 'kcc' && (
                                <div className="skeuo-card rounded-2xl p-5 md:p-6 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-green-600 text-2xl mt-0.5">info</span>
                                        <div>
                                            <h5 className="font-bold text-green-800 dark:text-green-300 mb-1">{tp('KCC Interest Subvention')}</h5>
                                            <p className="text-sm text-green-700 dark:text-green-400">{tp('Under the Government of India scheme, KCC loans up to ₹3 lakhs receive a 2% interest subvention (effective rate ~4%). Timely repayment earns an additional 3% prompt repayment incentive, bringing the rate down to as low as')} <strong>4% {tp('p.a.')}</strong></p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
