'use client';

import { useState, useEffect, useCallback } from 'react';
import EarningsSummary from '@/components/provider/EarningsSummary';
import { useProviderT } from '@/i18n/providerTranslations';
import {
    fetchProviderEarnings,
    fetchProviderBookings,
    type ProviderEarnings,
    type ProviderBooking,
} from '@/app/actions/provider';

export default function WalletScreen() {
    const pt = useProviderT();
    const [earnings, setEarnings] = useState<ProviderEarnings | null>(null);
    const [transactions, setTransactions] = useState<ProviderBooking[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const [e, b] = await Promise.all([fetchProviderEarnings(), fetchProviderBookings('completed')]);
        setEarnings(e.data);
        setTransactions(b.data);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const balance = earnings?.net_earnings || 0;

    return (
        <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{pt('walletTitle')}</h1>

            {/* Balance card */}
            <div className="rounded-3xl bg-gradient-to-br from-primary to-emerald-600 text-white p-6 mb-5 shadow-md">
                <p className="text-sm font-semibold text-white/80 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                    {pt('walletBalance')}
                </p>
                <p className="text-4xl font-black mt-2">₹{balance.toLocaleString('en-IN')}</p>
                <p className="text-xs text-white/70 mt-1">{pt('netEarningsNote')}</p>
            </div>

            {loading ? (
                <p className="text-sm text-gray-400 text-center py-8">…</p>
            ) : (
                <>
                    {earnings && <EarningsSummary earnings={earnings} />}

                    {/* Transactions */}
                    <h2 className="text-base font-black text-gray-900 dark:text-white mt-6 mb-3">{pt('transactions')}</h2>
                    {transactions.length === 0 ? (
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
                            <span className="material-symbols-outlined text-4xl text-gray-300">receipt_long</span>
                            <p className="text-sm font-bold text-gray-500 mt-2">{pt('noTransactions')}</p>
                            <p className="text-xs text-gray-400">{pt('noTransactionsHint')}</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                            {transactions.map(t => {
                                const net = (t.amount || 0) - (t.commission || 0);
                                return (
                                    <div key={t.id} className="flex items-center gap-3 p-4">
                                        <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-green-600 text-lg">south_west</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white capitalize truncate">
                                                {(t.module === 'services' ? t.category : t.module).replace(/[-_]/g, ' ')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {t.full_name} · {t.completed_at ? new Date(t.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-green-600 shrink-0">+₹{net.toLocaleString('en-IN')}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
