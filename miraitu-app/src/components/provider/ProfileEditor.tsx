'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserProfile } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import AvailabilityToggle from '@/components/provider/AvailabilityToggle';
import { updateProviderAvailability } from '@/app/actions/provider';

interface ProfileEditorProps {
    profile: UserProfile;
    onSaved?: () => void;
}

const DAYS: { key: string; label: string }[] = [
    { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
];

type WorkingHours = Record<string, { open: string; close: string; closed?: boolean }>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-bold text-gray-500">{label}</label>
            <div className="mt-1">{children}</div>
        </div>
    );
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-primary';

export default function ProfileEditor({ profile, onSaved }: ProfileEditorProps) {
    const { user, updateProfile, uploadAvatar, deleteAccount } = useAuth();
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);

    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || user?.photoURL || '');
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        whatsapp_number: profile.whatsapp_number || '',
        business_name: profile.business_name || '',
        bio: profile.bio || '',
        address: profile.address || '',
        district: profile.district || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        service_area_text: profile.service_area_text || '',
        service_radius_km: profile.service_radius_km ?? '',
    });

    const [hours, setHours] = useState<WorkingHours>(() => {
        const base: WorkingHours = {};
        for (const d of DAYS) {
            const existing = profile.working_hours?.[d.key];
            base[d.key] = existing || { open: '09:00', close: '18:00', closed: false };
        }
        return base;
    });

    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // Account/security
    const [email, setEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountMsg, setAccountMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
    const [accountBusy, setAccountBusy] = useState(false);

    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const { url, error } = await uploadAvatar(file);
        setUploading(false);
        if (url && !error) setAvatarUrl(url);
        else setSaveMsg(error || 'Failed to upload image');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg(null);
        const { error } = await updateProfile({
            full_name: form.full_name.trim() || null,
            phone: form.phone.trim() || null,
            whatsapp_number: form.whatsapp_number.trim() || null,
            business_name: form.business_name.trim() || null,
            bio: form.bio.trim() || null,
            address: form.address.trim() || null,
            district: form.district.trim() || null,
            state: form.state.trim() || null,
            pincode: form.pincode.trim() || null,
            service_area_text: form.service_area_text.trim() || null,
            service_radius_km: form.service_radius_km === '' ? null : Number(form.service_radius_km),
            working_hours: hours,
        });
        setSaving(false);
        setSaveMsg(error ? error : 'Profile saved');
        if (!error) onSaved?.();
    };

    const handleAccountUpdate = async () => {
        setAccountMsg(null);
        if (newPassword || confirmPassword) {
            if (newPassword.length < 6) { setAccountMsg({ type: 'err', text: 'Password must be at least 6 characters' }); return; }
            if (newPassword !== confirmPassword) { setAccountMsg({ type: 'err', text: 'Passwords do not match' }); return; }
        }
        setAccountBusy(true);
        try {
            const payload: { email?: string; password?: string } = {};
            if (email && email !== user?.email) payload.email = email.trim().toLowerCase();
            if (newPassword) payload.password = newPassword;
            if (Object.keys(payload).length === 0) {
                setAccountMsg({ type: 'err', text: 'Nothing to update' });
                return;
            }
            const { error } = await supabase.auth.updateUser(payload);
            if (error) { setAccountMsg({ type: 'err', text: error.message }); return; }
            setNewPassword(''); setConfirmPassword('');
            setAccountMsg({ type: 'ok', text: payload.email ? 'Updated. Check your inbox to confirm the new email.' : 'Password updated' });
        } finally {
            setAccountBusy(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        const { error } = await deleteAccount();
        setDeleting(false);
        if (error) { setSaveMsg(error); return; }
        router.replace('/');
    };

    return (
        <div className="space-y-4">
            {/* Avatar + availability */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="size-16 rounded-2xl bg-primary/10 overflow-hidden flex items-center justify-center">
                            {avatarUrl
                                ? <img src={avatarUrl} alt="avatar" className="size-full object-cover" />
                                : <span className="material-symbols-outlined text-primary text-3xl">engineering</span>}
                        </div>
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary text-white flex items-center justify-center shadow disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">{uploading ? 'progress_activity' : 'photo_camera'}</span>
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-black text-gray-900 dark:text-white truncate">{form.full_name || 'Your name'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || user?.phone}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <AvailabilityToggle
                        initialStatus={(profile.availability_status as 'available' | 'busy' | 'offline') || 'available'}
                        onStatusChange={async (s) => { await updateProviderAvailability(s); }}
                    />
                </div>
            </div>

            {/* Basic details */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Basic details</h3>
                <Field label="Full name"><input value={form.full_name} onChange={e => set('full_name', e.target.value)} className={inputCls} /></Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone"><input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} /></Field>
                    <Field label="WhatsApp"><input value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} className={inputCls} /></Field>
                </div>
                <Field label="Business name"><input value={form.business_name} onChange={e => set('business_name', e.target.value)} className={inputCls} /></Field>
                <Field label="Bio"><textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={2} className={`${inputCls} resize-none`} /></Field>
            </div>

            {/* Address + service area */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Address & service area</h3>
                <Field label="Address"><input value={form.address} onChange={e => set('address', e.target.value)} className={inputCls} /></Field>
                <div className="grid grid-cols-3 gap-3">
                    <Field label="District"><input value={form.district} onChange={e => set('district', e.target.value)} className={inputCls} /></Field>
                    <Field label="State"><input value={form.state} onChange={e => set('state', e.target.value)} className={inputCls} /></Field>
                    <Field label="Pincode"><input value={form.pincode} onChange={e => set('pincode', e.target.value)} className={inputCls} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Service area"><input value={form.service_area_text} onChange={e => set('service_area_text', e.target.value)} placeholder="e.g. Nashik & nearby" className={inputCls} /></Field>
                    <Field label="Service radius (km)"><input type="number" min={0} value={form.service_radius_km} onChange={e => set('service_radius_km', e.target.value)} className={inputCls} /></Field>
                </div>
            </div>

            {/* Working hours */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Working hours</h3>
                <div className="space-y-2">
                    {DAYS.map(d => {
                        const h = hours[d.key];
                        return (
                            <div key={d.key} className="flex items-center gap-2">
                                <span className="w-10 text-xs font-bold text-gray-500">{d.label}</span>
                                {h.closed ? (
                                    <span className="flex-1 text-xs text-gray-400">Closed</span>
                                ) : (
                                    <div className="flex-1 flex items-center gap-2">
                                        <input type="time" value={h.open}
                                            onChange={e => setHours(p => ({ ...p, [d.key]: { ...p[d.key], open: e.target.value } }))}
                                            className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs" />
                                        <span className="text-xs text-gray-400">–</span>
                                        <input type="time" value={h.close}
                                            onChange={e => setHours(p => ({ ...p, [d.key]: { ...p[d.key], close: e.target.value } }))}
                                            className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs" />
                                    </div>
                                )}
                                <label className="flex items-center gap-1 text-[10px] font-bold text-gray-400 cursor-pointer">
                                    <input type="checkbox" checked={!!h.closed}
                                        onChange={e => setHours(p => ({ ...p, [d.key]: { ...p[d.key], closed: e.target.checked } }))}
                                        className="size-3.5 accent-primary" />
                                    Closed
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving}
                    className="px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    {saving ? 'Saving…' : 'Save profile'}
                </button>
                {saveMsg && <span className={`text-xs font-semibold ${saveMsg.includes('saved') ? 'text-green-600' : 'text-red-500'}`}>{saveMsg}</span>}
            </div>

            {/* Account & security */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Account & security</h3>
                <Field label="Email"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} /></Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="New password"><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputCls} /></Field>
                    <Field label="Confirm password"><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls} /></Field>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleAccountUpdate} disabled={accountBusy}
                        className="px-4 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
                        {accountBusy ? 'Updating…' : 'Update account'}
                    </button>
                    {accountMsg && <span className={`text-xs font-semibold ${accountMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{accountMsg.text}</span>}
                </div>
            </div>

            {/* Danger zone */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 p-5">
                <h3 className="text-sm font-bold text-red-600 mb-1">Delete account</h3>
                <p className="text-xs text-red-500/80 mb-3">This permanently removes your profile, services and data. This cannot be undone.</p>
                {confirmDelete ? (
                    <div className="flex items-center gap-3">
                        <button onClick={handleDelete} disabled={deleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50">
                            {deleting ? 'Deleting…' : 'Yes, delete my account'}
                        </button>
                        <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 text-xs font-bold text-gray-500">Cancel</button>
                    </div>
                ) : (
                    <button onClick={() => setConfirmDelete(true)}
                        className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20">
                        Delete account
                    </button>
                )}
            </div>
        </div>
    );
}
