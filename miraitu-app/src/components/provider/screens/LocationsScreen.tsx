'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProviderTab } from '@/hooks/useProviderTab';
import { useProviderT } from '@/i18n/providerTranslations';
import {
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    type UserAddress,
    type AddressInput,
} from '@/app/actions/user-addresses';

const empty: AddressInput = { label: 'Home', address: '', district: '', state: '', pincode: '', is_default: false };
const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary';

export default function LocationsScreen() {
    const [, setTab] = useProviderTab();
    const pt = useProviderT();
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<AddressInput>(empty);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetchAddresses();
        setAddresses(res.data);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAdd = () => { setEditingId(null); setForm(empty); setError(null); setShowForm(true); };
    const openEdit = (a: UserAddress) => {
        setEditingId(a.id);
        setForm({ label: a.label, address: a.address || '', district: a.district || '', state: a.state || '', pincode: a.pincode || '', is_default: a.is_default });
        setError(null);
        setShowForm(true);
    };

    const submit = async () => {
        setError(null);
        if (!form.address?.trim()) { setError('Address is required'); return; }
        setSaving(true);
        const res = editingId ? await updateAddress(editingId, form) : await addAddress(form);
        setSaving(false);
        if (!res.success) { setError(res.error || 'Failed to save'); return; }
        setShowForm(false);
        await load();
    };

    const handleDelete = async (id: string) => { if (confirm('Delete this location?')) { await deleteAddress(id); await load(); } };
    const handleDefault = async (id: string) => { await setDefaultAddress(id); await load(); };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setTab('profile')} className="size-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex-1">{pt('manageLocations')}</h1>
                <button onClick={openAdd} className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">add</span>{pt('add')}
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-gray-400 text-center py-10">…</p>
            ) : addresses.length === 0 ? (
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300">location_off</span>
                    <p className="text-sm font-bold text-gray-500 mt-2">{pt('noLocations')}</p>
                    <p className="text-xs text-gray-400">{pt('noLocationsHint')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map(a => (
                        <div key={a.id} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary mt-0.5">location_on</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{a.label}</p>
                                    {a.is_default && <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">{pt('default')}</span>}
                                </div>
                                <p className="text-xs text-gray-500">{[a.address, a.district, a.state, a.pincode].filter(Boolean).join(', ')}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    {!a.is_default && <button onClick={() => handleDefault(a.id)} className="text-xs font-bold text-primary">{pt('setDefault')}</button>}
                                    <button onClick={() => openEdit(a)} className="text-xs font-bold text-gray-500">{pt('edit')}</button>
                                    <button onClick={() => handleDelete(a.id)} className="text-xs font-bold text-red-500">{pt('delete')}</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-[#1a231a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-black text-gray-900 dark:text-white">{editingId ? pt('editLocation') : pt('addLocation')}</h4>
                            <button onClick={() => setShowForm(false)} className="p-1"><span className="material-symbols-outlined text-gray-400">close</span></button>
                        </div>
                        <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Label (Home, Work…)" className={inputCls} />
                        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address *" className={inputCls} />
                        <div className="grid grid-cols-2 gap-3">
                            <input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="District" className={inputCls} />
                            <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="State" className={inputCls} />
                        </div>
                        <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="Pincode" className={inputCls} />
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} className="size-4 accent-primary" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{pt('setAsDefault')}</span>
                        </label>
                        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
                        <button onClick={submit} disabled={saving} className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50">
                            {saving ? pt('saving') : editingId ? pt('editLocation') : pt('addLocation')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
