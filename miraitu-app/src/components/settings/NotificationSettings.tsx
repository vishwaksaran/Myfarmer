'use client';

import { useState } from 'react';

export default function NotificationSettings() {
    const [settings, setSettings] = useState([
        { id: 'prices', title: 'Market Price Alerts', desc: 'Updates on crop prices', active: true },
        { id: 'weather', title: 'Weather Warnings', desc: 'Critical storm notifications', active: true },
        { id: 'voice', title: 'Voice Assistant', desc: 'Audio prompts for tasks', active: false },
    ]);

    const toggle = (id: string) => {
        setSettings(settings.map(s => s.id === id ? { ...s, active: !s.active } : s));
    };

    return (
        <section className="rounded-3xl bg-white p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <h2 className="text-2xl font-bold text-primary-dark">Notifications</h2>
            </div>
            <div className="space-y-3">
                {settings.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#fafafa] hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-bold text-primary-dark">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={item.active}
                            onClick={() => toggle(item.id)}
                            className="glossy-switch relative inline-flex h-8 w-14 shrink-0"
                        >
                            <span
                                className={`switch-knob mt-[1px] ml-[1px] ${item.active ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
