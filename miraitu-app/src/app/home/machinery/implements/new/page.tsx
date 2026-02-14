'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';

const newImplements = [
    {
        id: 1,
        name: 'Fieldstar Disc Harrow',
        category: 'Implement',
        specs: '16 Discs • Heavy Duty • Mounted',
        price: '₹55,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrP7cN8CTOtAkybDCL0QlIA-JizzfFm72xhbedX54SXeP4sbtxIadoSuijbGsc06AkXwxnUGnebgrcKT3PFZgziYLbXXBogmFMQ7xsAkpUYd5JPOZAaqHAfqbXgDQjkgbin1xqfhrWYaZKPOfumKTzC3EM3vOdwhqexqjl4m4-_9vRyI_ub_fWBU49A9oNMzlgBLNY7E9svHG0jZ7CBGCrA52KpkUC3qmlwTihE8bkTBp3_Z3WcD8yf3tzkKvKK6xIiZOPaQbOPyHC',
        brand: 'Fieldstar',
        hp: '22 Inches',
    },
    {
        id: 2,
        name: 'Mahindra Rotavator',
        category: 'Implement',
        specs: '6 Feet • 48 Blades • Multi-Speed',
        price: '₹85,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'Mahindra',
        hp: '6 Feet',
    },
    {
        id: 3,
        name: 'Shaktiman Cultivator',
        category: 'Implement',
        specs: '9 Tynes • Spring Loaded • Heavy Duty',
        price: '₹28,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Shaktiman',
        hp: '9 Tynes',
    },
    {
        id: 4,
        name: 'Landforce MB Plough',
        category: 'Implement',
        specs: '3 Bottom • Reversible • Hydraulic',
        price: '₹45,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Landforce',
        hp: '3 Bottom',
    },
    {
        id: 5,
        name: 'John Deere Seed Drill',
        category: 'Implement',
        specs: '11 Row • Zero Till • Fertilizer Box',
        price: '₹1,20,000',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'John Deere',
        hp: '11 Row',
    },
    {
        id: 6,
        name: 'Khedut Boom Sprayer',
        category: 'Implement',
        specs: '500 Litre • Tractor Mounted • 12m Boom',
        price: '₹65,000',
        image: 'https://images.unsplash.com/photo-1588684658936-f1c3b8d3c2e8?w=400&h=300&fit=crop',
        brand: 'Khedut',
        hp: '500L',
    },
];

export default function NewImplementsPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const compareItems = newImplements.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New Implements</h1>
                    <p className="text-gray-500">Browse ploughs, harrows, seeders, and other farming implements with warranty.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Types</option>
                        <option>Disc Harrow</option>
                        <option>Rotavator</option>
                        <option>Cultivator</option>
                        <option>Plough</option>
                        <option>Seed Drill</option>
                        <option>Sprayer</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Brands</option>
                        <option>Fieldstar</option>
                        <option>Mahindra</option>
                        <option>Shaktiman</option>
                        <option>Landforce</option>
                        <option>John Deere</option>
                        <option>Khedut</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹30,000</option>
                        <option>₹30,000 - ₹60,000</option>
                        <option>₹60,000 - ₹1,00,000</option>
                        <option>Above ₹1,00,000</option>
                    </select>
                </div>

                <MachineryListing
                    items={newImplements}
                    type="new"
                    onCompare={toggleSelection}
                    selectedForCompare={selectedItems}
                />

                <CompareModal
                    isOpen={showCompareModal}
                    onClose={() => setShowCompareModal(false)}
                    items={compareItems}
                />
            </div>
        </div>
    );
}

