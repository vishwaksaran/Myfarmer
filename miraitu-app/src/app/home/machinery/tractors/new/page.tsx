'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';

const newTractors = [
    {
        id: 1,
        name: 'Mahindra Yuvo 575 DI',
        category: 'Tractor',
        specs: '45 HP • 4 Cylinder • 4WD • Power Steering',
        price: '₹7,20,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '45',
        warranty: '6 Years',
        fuelType: 'Diesel',
    },
    {
        id: 2,
        name: 'John Deere 5050E',
        category: 'Tractor',
        specs: '50 HP • Power Steering • Dual Clutch',
        price: '₹8,55,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM8TSKMPgBVKfBrFRv35XUcQxeNHBCocIJr-EhVwMsXpwRhwUfh8cJyAb_jlT3KlL-gTNVeV0UmU686uHIlpl66NlgQc8j2y6cEKwXPEkUMRpxvpQ6NljEMRXJdg2BvModl1ckkJlngdiilgPFQIdLBDuxv2QILSkUIwinzeUFso79NyvpTB4JTb2CHOOWK7Wi5DzLIQfkaqRyRnCmqmDFKoA88uyZOE_7mB9NHLUZ34oThbXIRVjACMbxoUB-EgVCwZECqbl8XnE',
        brand: 'John Deere',
        hp: '50',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },
    {
        id: 3,
        name: 'Swaraj 855 FE',
        category: 'Tractor',
        specs: '52 HP • Oil Immersed Brakes • 4WD',
        price: '₹9,10,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Swaraj',
        hp: '52',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },
    {
        id: 4,
        name: 'Sonalika Tiger DI 60',
        category: 'Tractor',
        specs: '60 HP • Multi Speed PTO • Hydraulic',
        price: '₹9,10,000',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'Sonalika',
        hp: '60',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },
    {
        id: 5,
        name: 'New Holland 3630 TX Plus',
        category: 'Tractor',
        specs: '55 HP • Synchromesh Gearbox • Air Cleaner',
        price: '₹8,75,000',
        image: 'https://images.unsplash.com/photo-1588684658936-f1c3b8d3c2e8?w=400&h=300&fit=crop',
        brand: 'New Holland',
        hp: '55',
        warranty: '4 Years',
        fuelType: 'Diesel',
    },
    {
        id: 6,
        name: 'Kubota MU4501',
        category: 'Tractor',
        specs: '45 HP • ISM Technology • 8F+2R Gears',
        price: '₹7,85,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Kubota',
        hp: '45',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },
];

export default function NewTractorsPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const compareItems = newTractors.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New Tractors</h1>
                    <p className="text-gray-500">Browse brand new tractors with manufacturer warranty. Get on-road price instantly.</p>
                </div>

                {/* Filters Bar */}
                <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Brands</option>
                        <option>Mahindra</option>
                        <option>John Deere</option>
                        <option>Swaraj</option>
                        <option>Sonalika</option>
                        <option>New Holland</option>
                        <option>Kubota</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>HP Range</option>
                        <option>25-35 HP</option>
                        <option>35-45 HP</option>
                        <option>45-55 HP</option>
                        <option>55-65 HP</option>
                        <option>65+ HP</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹5 Lakhs</option>
                        <option>₹5-8 Lakhs</option>
                        <option>₹8-12 Lakhs</option>
                        <option>Above ₹12 Lakhs</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                            <option>Popular</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Listing */}
                <MachineryListing
                    items={newTractors}
                    type="new"
                    onCompare={toggleSelection}
                    selectedForCompare={selectedItems}
                />

                {/* Compare Modal */}
                <CompareModal
                    isOpen={showCompareModal}
                    onClose={() => setShowCompareModal(false)}
                    items={compareItems}
                />
            </div>
        </div>
    );
}

