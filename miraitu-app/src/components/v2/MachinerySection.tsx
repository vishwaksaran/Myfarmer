'use client';

import { useState } from 'react';
import Link from 'next/link';
import CompareModal from '@/components/v2/machinery/CompareModal';
import { useLanguage } from '@/i18n/LanguageContext';

const machineryData = [
    {
        id: 1,
        name: 'John Deere 5050E',
        category: 'Tractor',
        specs: '50 HP | 4WD | Power Steering',
        price: '₹8.5 Lakhs',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM8TSKMPgBVKfBrFRv35XUcQxeNHBCocIJr-EhVwMsXpwRhwUfh8cJyAb_jlT3KlL-gTNVeV0UmU686uHIlpl66NlgQc8j2y6cEKwXPEkUMRpxvpQ6NljEMRXJdg2BvModl1ckkJlngdiilgPFQIdLBDuxv2QILSkUIwinzeUFso79NyvpTB4JTb2CHOOWK7Wi5DzLIQfkaqRyRnCmqmDFKoA88uyZOE_7mB9NHLUZ34oThbXIRVjACMbxoUB-EgVCwZECqbl8XnE',
    },
    {
        id: 2,
        name: 'Mahindra Yuvo 575',
        category: 'Tractor',
        specs: '45 HP | High Torque | Fuel Efficient',
        price: '₹7.2 Lakhs',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        checked: true,
    },
    {
        id: 3,
        name: 'Fieldstar Disc Harrow',
        category: 'Tilling Equipment',
        specs: '16 Discs | Heavy Duty | Mounted',
        price: '₹55,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrP7cN8CTOtAkybDCL0QlIA-JizzfFm72xhbedX54SXeP4sbtxIadoSuijbGsc06AkXwxnUGnebgrcKT3PFZgziYLbXXBogmFMQ7xsAkpUYd5JPOZAaqHAfqbXgDQjkgbin1xqfhrWYaZKPOfumKTzC3EM3vOdwhqexqjl4m4-_9vRyI_ub_fWBU49A9oNMzlgBLNY7E9svHG0jZ7CBGCrA52KpkUC3qmlwTihE8bkTBp3_Z3WcD8yf3tzkKvKK6xIiZOPaQbOPyHC',
    },
    {
        id: 4,
        name: 'Kubota Combine Harvester',
        category: 'Harvester',
        specs: 'Self-Propelled | 4-Row | Efficient',
        price: '₹12.5 Lakhs',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
    },
];

export default function MachinerySection() {
    const { t } = useLanguage();
    const [selectedItems, setSelectedItems] = useState<number[]>([2]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 2) {
                return prev;
            }
            return [...prev, id];
        });
    };

    return (
        <section className="bg-[#ebf0ea]/50 dark:bg-background-dark/30 px-6 py-16 relative hidden">
            {/* WhatsApp Button */}
            <a
                href="https://wa.me/917448410198?text=Hi,%20I'm%20interested%20in%20machinery"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 z-50 flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
            >
                <svg className="size-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            </a>

            <div className="mx-auto max-w-[1280px]">
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{t('machinery.title')}</h2>
                        <p className="text-gray-500">{t('machinery.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowCompareModal(true)}
                            disabled={selectedItems.length < 2}
                            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg border border-black/5 ${selectedItems.length >= 2
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-[#1a231a]'
                                }`}
                        >
                            <span className="material-symbols-outlined">compare_arrows</span>
                            {t('machinery.compare')} ({selectedItems.length})
                        </button>
                        <Link
                            href="/v2/machinery"
                            className="skeuo-button-3d flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                        >
                            {t('machinery.seeMore')}
                            <span className="material-symbols-outlined text-lg">arrow_forward_ios</span>
                        </Link>
                    </div>
                </div>

                {/* Product Grid - Full Width */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {machineryData.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        const isDisabled = !isSelected && selectedItems.length >= 2;

                        return (
                            <div key={item.id} className="skeuo-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/10">
                                <label className={`absolute right-3 top-3 z-10 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                    <input
                                        checked={isSelected}
                                        onChange={() => toggleSelection(item.id)}
                                        disabled={isDisabled}
                                        className="h-6 w-6 rounded-lg border-white/50 bg-black/20 text-accent focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="checkbox"
                                    />
                                </label>

                                {/* Category Badge */}
                                <div className="absolute left-3 top-3 z-10">
                                    <span className="inline-block rounded-lg bg-primary/90 px-2 py-1 text-xs font-bold text-white">
                                        {item.category}
                                    </span>
                                </div>

                                <div
                                    className="aspect-[4/3] w-full bg-cover bg-center"
                                    style={{ backgroundImage: `url('${item.image}')` }}
                                ></div>
                                <div className="p-4">
                                    <h4 className="font-bold">{item.name}</h4>
                                    <p className="text-xs text-gray-500">{item.specs}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-sm font-bold text-primary">{item.price}</span>
                                        <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
                                            {t('machinery.viewDetails')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Compare Modal */}
            <CompareModal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                items={machineryData.filter(item => selectedItems.includes(item.id)).map(item => ({
                    ...item,
                    brand: item.name.split(' ')[0],
                    hp: item.specs.split(' ')[0],
                    warranty: '2 Years',
                    fuelType: 'Diesel',
                }))}
            />
        </section>
    );
}
