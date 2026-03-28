'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVendorAuth } from '@/context/VendorAuthContext';

export default function VendorSettingsPage() {
    const { vendor, refreshSession } = useVendorAuth();
    const searchParams = useSearchParams();
    const forcePassword = searchParams.get('force') === 'password';

    const [activeTab, setActiveTab] = useState<'account' | 'profile'>(forcePassword ? 'account' : 'account');

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Settings</h1>
            <p className="text-sm text-gray-500 mb-6">Manage your account and preferences</p>

            {/* Force password change banner */}
            {forcePassword && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <span className="material-symbols-outlined text-amber-600 text-xl">warning</span>
                    <div>
                        <p className="text-sm font-bold text-amber-800">Change your temporary password</p>
                        <p className="text-xs text-amber-600 mt-0.5">You must set a new password before continuing.</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('account')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'account' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Account
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Profile
                </button>
            </div>

            {activeTab === 'account' && (
                <AccountSettings vendor={vendor} forcePassword={forcePassword} onUpdated={refreshSession} />
            )}

            {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-sm text-gray-500">Profile settings coming soon.</p>
                </div>
            )}
        </div>
    );
}

function AccountSettings({
    vendor,
    forcePassword,
    onUpdated,
}: {
    vendor: { id: string; username: string; displayName: string; email: string | null; isTempPassword: boolean } | null;
    forcePassword: boolean;
    onUpdated: () => void;
}) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword) {
            setError('Current password is required.');
            return;
        }

        if (!newUsername && !newPassword) {
            setError('Enter a new username or password to update.');
            return;
        }

        if (newPassword && newPassword.length < 8) {
            setError('New password must be at least 8 characters.');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/vendor/auth/change-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newUsername: newUsername || undefined,
                    newPassword: newPassword || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to update credentials.');
                setSubmitting(false);
                return;
            }

            setSuccess('Credentials updated successfully!');
            setCurrentPassword('');
            setNewUsername('');
            setNewPassword('');
            setConfirmPassword('');
            onUpdated();

            // If was forced, reload to clear the force param
            if (forcePassword) {
                setTimeout(() => {
                    window.location.href = window.location.pathname.replace('/settings', '/dashboard');
                }, 1500);
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Account Credentials</h2>
            <p className="text-xs text-gray-500 mb-6">
                Current username: <strong className="text-gray-700">@{vendor?.username}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        {success}
                    </div>
                )}

                {/* Current Password (required) */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Current Password *
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            required
                            autoComplete="current-password"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* New Username (optional) */}
                {!forcePassword && (
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            New Username <span className="text-gray-400 normal-case">(optional)</span>
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                placeholder={vendor?.username || 'Leave blank to keep current'}
                                autoComplete="username"
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />
                        </div>
                    </div>
                )}

                {/* New Password */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        New Password {forcePassword ? '*' : <span className="text-gray-400 normal-case">(optional)</span>}
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">key</span>
                        <input
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            required={forcePassword}
                            minLength={8}
                            autoComplete="new-password"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                    </div>
                </div>

                {/* Confirm Password */}
                {newPassword && (
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            Confirm New Password *
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">key</span>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                required
                                autoComplete="new-password"
                                className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 ${
                                    confirmPassword && confirmPassword !== newPassword
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-200 focus:border-green-500 focus:ring-green-500/20'
                                }`}
                            />
                        </div>
                    </div>
                )}

                {/* Show passwords toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={() => setShowPasswords(!showPasswords)}
                        className="rounded border-gray-300"
                    />
                    <span className="text-xs text-gray-500">Show passwords</span>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting || !currentPassword || (!newUsername && !newPassword)}
                    className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            Updating...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">save</span>
                            {forcePassword ? 'Set New Password' : 'Update Credentials'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
