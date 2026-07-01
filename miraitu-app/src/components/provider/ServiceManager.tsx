'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    fetchProviderServices,
    createProviderService,
    updateProviderService,
    deleteProviderService,
    toggleServiceAvailability,
    type ProviderService,
    type ServiceInput,
} from '@/app/actions/provider-services';
import { MAX_SERVICE_PRICE, SERVICE_CATEGORY_OPTIONS } from '@/lib/provider-config';

interface ServiceManagerProps {
    serviceTypes: string[];
    /** Called after service categories are saved, so the parent can refresh. */
    onCategoriesChange?: (types: string[]) => void;
}

const emptyForm: ServiceInput = { name: '', description: '', price: 0, unit: 'per service', is_available: true };

export default function ServiceManager({ serviceTypes, onCategoriesChange }: ServiceManagerProps) {
    const { updateProfile } = useAuth();
    const [services, setServices] = useState<ProviderService[]>([]);
    const [loading, setLoading] = useState(true);

    // Category selection state
    const [categories, setCategories] = useState<string[]>(serviceTypes || []);
    const [savingCategories, setSavingCategories] = useState(false);
    const [categoryMsg, setCategoryMsg] = useState<string | null>(null);

    // Service form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ServiceInput>(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetchProviderServices();
        setServices(res.data);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setCategories(serviceTypes || []); }, [serviceTypes]);

    const toggleCategory = (id: string) => {
        setCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
        setCategoryMsg(null);
    };

    const saveCategories = async () => {
        setSavingCategories(true);
        setCategoryMsg(null);
        const { error } = await updateProfile({ service_types: categories });
        setSavingCategories(false);
        if (error) { setCategoryMsg(error); return; }
        setCategoryMsg('Saved');
        onCategoriesChange?.(categories);
    };

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError(null);
        setShowForm(true);
    };

    const openEdit = (s: ProviderService) => {
        setEditingId(s.id);
        setForm({ name: s.name, description: s.description || '', price: s.price, unit: s.unit, is_available: s.is_available });
        setFormError(null);
        setShowForm(true);
    };

    const submitForm = async () => {
        setFormError(null);
        if (!form.name.trim()) { setFormError('Service name is required'); return; }
        if ((form.price ?? 0) > MAX_SERVICE_PRICE) {
            setFormError(`Price cannot exceed ₹${MAX_SERVICE_PRICE.toLocaleString('en-IN')}`);
            return;
        }
        if ((form.price ?? 0) < 0) { setFormError('Price must be positive'); return; }
        setSaving(true);
        const res = editingId
            ? await updateProviderService(editingId, form)
            : await createProviderService(form);
        setSaving(false);
        if (!res.success) { setFormError(res.error || 'Failed to save'); return; }
        setShowForm(false);
        await load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this service?')) return;
        await deleteProviderService(id);
        await load();
    };

    const handleToggle = async (s: ProviderService) => {
        setServices(prev => prev.map(x => x.id === s.id ? { ...x, is_available: !x.is_available } : x));
        await toggleServiceAvailability(s.id, !s.is_available);
    };

    return (
        <div className="space-y-6">
            {/* ─── Service Categories ─── */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">category</span>
                    Service Categories
                </h3>
                <p className="text-xs text-gray-500 mb-3">Pick what you offer — this decides which jobs get auto-assigned to you.</p>
                <div className="flex flex-wrap gap-2">
                    {SERVICE_CATEGORY_OPTIONS.map(opt => {
                        const active = categories.includes(opt.id);
                        return (
                            <button
                                key={opt.id}
                                onClick={() => toggleCategory(opt.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                    active
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <button
                        onClick={saveCategories}
                        disabled={savingCategories}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {savingCategories ? 'Saving…' : 'Save categories'}
                    </button>
                    {categoryMsg && (
                        <span className={`text-xs font-semibold ${categoryMsg === 'Saved' ? 'text-green-600' : 'text-red-500'}`}>
                            {categoryMsg}
                        </span>
                    )}
                </div>
            </div>

            {/* ─── Services list ─── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary">sell</span>
                        My Services & Pricing
                    </h3>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Service
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-sm text-gray-400">Loading…</div>
                ) : services.length === 0 ? (
                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">sell</span>
                        <p className="text-sm font-bold text-gray-500">No services added yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add the services you offer with pricing so customers know what to expect</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {services.map(s => (
                            <div key={s.id} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</p>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${s.is_available ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                            {s.is_available ? 'Available' : 'Off'}
                                        </span>
                                    </div>
                                    {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                                    <p className="text-sm font-black text-primary mt-1">
                                        {s.price > 0 ? `₹${s.price.toLocaleString('en-IN')}` : 'Price on request'}
                                        <span className="text-xs font-semibold text-gray-400"> {s.unit}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => handleToggle(s)} title="Toggle availability"
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                                        <span className="material-symbols-outlined text-lg">{s.is_available ? 'toggle_on' : 'toggle_off'}</span>
                                    </button>
                                    <button onClick={() => openEdit(s)} title="Edit"
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} title="Delete"
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Add / Edit form (modal) ─── */}
            {showForm && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white dark:bg-[#1a231a] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-black text-gray-900 dark:text-white">{editingId ? 'Edit Service' : 'Add Service'}</h4>
                            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined text-gray-400">close</span>
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500">Service name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Motor repair"
                                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Short description of the service"
                                rows={2}
                                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500">Price (₹)</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={MAX_SERVICE_PRICE}
                                    value={form.price}
                                    onChange={e => setForm(f => ({ ...f, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Unit</label>
                                <input
                                    value={form.unit}
                                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                                    placeholder="per hour / visit / litre"
                                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400">Max ₹{MAX_SERVICE_PRICE.toLocaleString('en-IN')}. Leave price 0 for &quot;on request&quot;.</p>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_available}
                                onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                                className="size-4 accent-primary"
                            />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Available for booking</span>
                        </label>

                        {formError && <p className="text-xs text-red-500 font-semibold">{formError}</p>}

                        <button
                            onClick={submitForm}
                            disabled={saving}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Saving…' : editingId ? 'Update Service' : 'Add Service'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
