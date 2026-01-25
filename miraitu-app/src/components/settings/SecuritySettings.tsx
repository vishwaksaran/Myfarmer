export default function SecuritySettings() {
    return (
        <section className="rounded-3xl bg-white p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">verified_user</span>
                </div>
                <h2 className="text-2xl font-bold text-primary-dark">Security Settings</h2>
            </div>
            <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#fafafa] hover:bg-gray-50 transition-all text-primary-dark group">
                    <span className="font-bold group-hover:text-primary">Change Password</span>
                    <span className="material-symbols-outlined text-primary transition-transform group-hover:translate-x-1">chevron_right</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#fafafa] hover:bg-gray-50 transition-all text-primary-dark group">
                    <span className="font-bold group-hover:text-primary">Two-Factor Authentication</span>
                    <span className="text-xs font-bold text-primary bg-lime-accent/30 px-3 py-1 rounded-full uppercase">Enabled</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#fafafa] hover:bg-gray-50 transition-all text-red-600 group">
                    <span className="font-bold">Delete Account</span>
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>
        </section>
    );
}
