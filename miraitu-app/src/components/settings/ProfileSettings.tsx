'use client';

import { useAuth } from '@/context/AuthContext';

export default function ProfileSettings() {
    const { user } = useAuth();

    // Use user data explicitly to ensure hydration match
    const photoURL = user?.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5_v_lniQz4XLFLkx3O3SeXzO_Vd6OB9PUYPojmux-I3GoGRPWmi8nSbcJqB7cWKvHsKMk0AyD1USWoxF7YsfgQyVHkGQjeNmdw0PR0Qi1wzn-frtFtoHACNhJiXyo8I7REszNvu-udHFbxLRDwTECoRY9bnVSKvnZhHpj2mU4s0rgVqHajBCUdg3GmLxAFMWSCgJF50CnNSZKZWHta7Ba7QWXeau-ssvkjFJMzWM1nN6JbYkzrl4ek9rB58CtkfVSOFTgTDHzGTFO';
    const displayName = user?.displayName || 'Harpreet Singh';

    return (
        <section className="rounded-3xl bg-harvest-loam p-1 shadow-soft-raised border border-[#e0e5df]">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 h-full">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                        <div className="size-24 lg:size-32 rounded-3xl bg-gradient-to-br from-[#e8eede] to-[#c5d3b6] shadow-soft-raised flex items-center justify-center p-2 border-t border-white overflow-hidden">
                            <img
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-2xl filter drop-shadow-md"
                                src={photoURL}
                            />
                            <div className="absolute bottom-2 right-2 size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-primary-dark transition-colors">
                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary-dark">Profile Settings</h2>
                        <p className="text-soil-dark font-medium">Update your 3D avatar and info</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-soil-dark mb-2">Full Name</label>
                        <input
                            className="w-full rounded-xl border-2 border-gray-200 bg-[#fbfbf7] focus:bg-white shadow-sm focus:shadow-md focus:ring-4 focus:ring-primary/10 focus:border-primary text-forest-charcoal font-bold text-lg py-4 px-5 outline-none transition-all placeholder:text-gray-300"
                            type="text"
                            defaultValue={displayName}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-soil-dark mb-2">Farm Location</label>
                        <div className="relative">
                            <input
                                className="w-full rounded-xl border-2 border-gray-200 bg-[#fbfbf7] focus:bg-white shadow-sm focus:shadow-md focus:ring-4 focus:ring-primary/10 focus:border-primary text-forest-charcoal font-bold text-lg py-4 px-5 outline-none transition-all placeholder:text-gray-300"
                                type="text"
                                defaultValue="Ludhiana, Punjab"
                            />
                            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary font-bold">location_on</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
