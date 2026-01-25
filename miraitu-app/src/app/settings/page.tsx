'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import ProfileSettings from '@/components/settings/ProfileSettings';
import LanguageSettings from '@/components/settings/LanguageSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { useAuth } from '@/context/AuthContext';
import MiraituLogo from '@/components/MiraituLogo';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    if (loading) return null;

    const userPhoto = user?.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5_v_lniQz4XLFLkx3O3SeXzO_Vd6OB9PUYPojmux-I3GoGRPWmi8nSbcJqB7cWKvHsKMk0AyD1USWoxF7YsfgQyVHkGQjeNmdw0PR0Qi1wzn-frtFtoHACNhJiXyo8I7REszNvu-udHFbxLRDwTECoRY9bnVSKvnZhHpj2mU4s0rgVqHajBCUdg3GmLxAFMWSCgJF50CnNSZKZWHta7Ba7QWXeau-ssvkjFJMzWM1nN6JbYkzrl4ek9rB58CtkfVSOFTgTDHzGTFO';

    return (
        <div className="flex h-screen bg-[#fbfaf9] overflow-hidden font-display">
            {/* Sidebar */}
            <div className="hidden lg:block h-full">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-full relative bg-background-light">
                {/* Background Illustration */}
                <div
                    className="absolute inset-x-0 bottom-0 top-[20%] z-0 pointer-events-none opacity-5"
                    style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5_v_lniQz4XLFLkx3O3SeXzO_Vd6OB9PUYPojmux-I3GoGRPWmi8nSbcJqB7cWKvHsKMk0AyD1USWoxF7YsfgQyVHkGQjeNmdw0PR0Qi1wzn-frtFtoHACNhJiXyo8I7REszNvu-udHFbxLRDwTECoRY9bnVSKvnZhHpj2mU4s0rgVqHajBCUdg3GmLxAFMWSCgJF50CnNSZKZWHta7Ba7QWXeau-ssvkjFJMzWM1nN6JbYkzrl4ek9rB58CtkfVSOFTgTDHzGTFO')",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'bottom right',
                        backgroundSize: '30%'
                    }}
                ></div>

                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-[#fbfaf9] border-b border-[#e0e5df] sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-2">
                        <MiraituLogo size={32} />
                        <h2 className="text-xl font-bold text-primary-dark">Miraitu</h2>
                    </div>
                    <div className="size-8 rounded-full bg-cover bg-center bg-gray-200" style={{ backgroundImage: `url(${userPhoto})` }}></div>
                </header>

                <div className="relative z-10 p-6 lg:p-10 max-w-[1200px] mx-auto pb-32">
                    <header className="mb-10 animate-fade-in-up">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-primary-dark tracking-tight">App Settings</h1>
                        <p className="text-lg text-soil-dark mt-2 font-medium">Manage your account and app preferences</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-stagger-in">
                        <ProfileSettings />
                        <LanguageSettings />
                        <NotificationSettings />
                        <SecuritySettings />
                    </div>

                    <div className="mt-12 flex justify-center animate-fade-in-up delay-200">
                        <button className="relative group h-16 w-full lg:w-96 rounded-2xl bg-gradient-to-b from-primary to-primary-dark text-white font-black text-xl shadow-floating hover:shadow-xl transition-all active:scale-95 border-b-4 border-black/20">
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined">save</span>
                                Save Changes
                            </span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
