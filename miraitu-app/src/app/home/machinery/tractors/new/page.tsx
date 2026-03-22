'use client';

import { useState, useMemo, useRef } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';
import CompareSection from '@/components/v2/machinery/CompareSection';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';
import BrandBanner from '@/components/v2/machinery/BrandBanner';
import PriceByState from '@/components/v2/machinery/PriceByState';
import type { BannerSlide } from '@/components/v2/machinery/BrandBanner';

// ─── Mahindra OJA 2xxx Series (Compact — Sugarcane/Cotton/Orchard/Banana) ───
// ─── Mahindra OJA 3xxx Series (Mid-Range — Multi-purpose) ───
// ─── Swaraj Target 630 (from brochure) ───
// ─── Existing models ───

const newTractors = [
    // ── Mahindra OJA 2xxx Compact Series ──
    {
        id: 101,
        name: 'Mahindra OJA 2121',
        category: 'Tractor',
        specs: '21 HP • 3 Cylinder • 8F+4R Gears • ADDC Hydraulics',
        price: '₹3,50,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '21',
        warranty: '5 Years',
        fuelType: 'Diesel',
        techPacks: ['PROJA'],
        features: {
            torqueNm: 73.5, rpm: 2400, cylinders: 3, gears: '8F+4R / 12F+12R',
            shiftType: 'Synchro Shuttle', transmission: 'Constant Mesh',
            ptoSpeed: '540/540E', hydraulicsCapacity: 950, draftSensing: 'ADDC',
            groundClearanceMm: 303, wheelbaseMm: 1560, turningRadiusM: 2.0,
            applications: ['Sugarcane', 'Cotton', 'Orchard', 'Banana'],
        },
    },
    {
        id: 102,
        name: 'Mahindra OJA 2124',
        category: 'Tractor',
        specs: '24 HP • 3 Cylinder • 12F+12R Gears • ADDC Hydraulics',
        price: '₹3,90,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '24',
        warranty: '5 Years',
        fuelType: 'Diesel',
        techPacks: ['ROBOJA', 'PROJA', 'MYOJA'],
        features: {
            torqueNm: 83.3, rpm: 2400, cylinders: 3, gears: '8F+4R / 12F+12R',
            shiftType: 'Synchro Shuttle', transmission: 'Constant Mesh',
            ptoSpeed: '540/540E', hydraulicsCapacity: 950, draftSensing: 'ADDC',
            groundClearanceMm: 330, wheelbaseMm: 1560, turningRadiusM: 2.1,
            applications: ['Sugarcane', 'Cotton', 'Orchard', 'Banana'],
        },
    },
    {
        id: 103,
        name: 'Mahindra OJA 2127',
        category: 'Tractor',
        specs: '27 HP • 3 Cylinder • 12F+12R Gears • EDDC Hydraulics',
        price: '₹4,20,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '27',
        warranty: '5 Years',
        fuelType: 'Diesel',
        techPacks: ['ROBOJA', 'PROJA', 'MYOJA'],
        features: {
            torqueNm: 83.1, rpm: 2700, cylinders: 3, gears: '12F+12R',
            shiftType: 'Synchro Shuttle', transmission: 'Constant Mesh',
            ptoSpeed: '540/540E', hydraulicsCapacity: 950, draftSensing: 'EDDC',
            groundClearanceMm: 330, wheelbaseMm: 1560, turningRadiusM: 2.1,
            applications: ['Sugarcane', 'Cotton', 'Orchard', 'Banana'],
        },
    },
    {
        id: 104,
        name: 'Mahindra OJA 2130',
        category: 'Tractor',
        specs: '30 HP • 3 Cylinder • 12F+12R Gears • EDDC Hydraulics',
        price: '₹4,80,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '30',
        warranty: '5 Years',
        fuelType: 'Diesel',
        techPacks: ['ROBOJA', 'PROJA', 'MYOJA'],
        features: {
            torqueNm: 83.7, rpm: 3000, cylinders: 3, gears: '8F+4R / 8F+8R / 12F+12R',
            shiftType: 'Synchro Shuttle', transmission: 'Constant Mesh',
            ptoSpeed: '540/540E', hydraulicsCapacity: 950, draftSensing: 'EDDC',
            groundClearanceMm: 330, wheelbaseMm: 1560, turningRadiusM: 2.1,
            applications: ['Sugarcane', 'Cotton', 'Orchard', 'Banana'],
        },
    },

    // ── Mahindra OJA 3xxx Mid-Range Series ──
    {
        id: 105,
        name: 'Mahindra OJA 3132',
        category: 'Tractor',
        specs: '32 HP • 3 Cylinder • 8F+8R Gears • Wet PTO • ADDC',
        price: '₹5,50,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '32',
        warranty: '5 Years',
        fuelType: 'Diesel',
        techPacks: ['PROJA', 'ROBOJA'],
        features: {
            torqueNm: 107.5, rpm: 2500, cylinders: 3, gears: '8F+8R',
            shiftType: 'Synchro Shuttle', transmission: 'Constant Mesh',
            ptoSpeed: '540/540E', ptoType: 'Wet PTO',
            hydraulicsCapacity: 950, draftSensing: 'ADDC',
            groundClearanceMm: 350, wheelbaseMm: 1660, turningRadiusM: 2.5,
            weightKg: 1335,
            applications: ['Rotary Tiller', 'Plough', 'Cultivator', 'Mulching', 'Trolley'],
        },
    },
    {
        id: 106,
        name: 'Mahindra OJA 3136',
        category: 'Tractor',
        specs: '36 HP • 3 Cylinder • 12F+12R Gears • Wet PTO • EDDC',
        price: '₹6,20,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '36',
        warranty: '5 Years',
        fuelType: 'Diesel',
        techPacks: ['ROBOJA', 'PROJA', 'MYOJA'],
        features: {
            torqueNm: 121, rpm: 2500, cylinders: 3, gears: '12F+12R',
            shiftType: 'Synchro Shuttle', transmission: 'Constant Mesh',
            ptoSpeed: '540/540E', ptoType: 'Wet PTO',
            hydraulicsCapacity: 950, draftSensing: 'EDDC',
            groundClearanceMm: 370, wheelbaseMm: 1660, turningRadiusM: 2.5,
            weightKg: 1365,
            applications: ['Rotary Tiller', 'Plough', 'Cultivator', 'Mulching', 'Sprayer', 'Trolley'],
        },
    },
    {
        id: 107,
        name: 'Mahindra OJA 3140',
        category: 'Tractor',
        specs: '40 HP • 3 Cylinder • 12F+12R Gears • Wet PTO • EDDC',
        price: '₹6,80,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '40',
        warranty: '5 Years',
        fuelType: 'Diesel',
        techPacks: ['ROBOJA', 'PROJA', 'MYOJA'],
        features: {
            torqueNm: 133, rpm: 2500, cylinders: 3, gears: '12F+12R',
            shiftType: 'Synchro Shuttle', transmission: 'Constant Mesh',
            ptoSpeed: '540/540E', ptoType: 'Wet PTO',
            hydraulicsCapacity: 950, draftSensing: 'EDDC',
            groundClearanceMm: 370, wheelbaseMm: 1660, turningRadiusM: 2.5,
            weightKg: 1365,
            applications: ['Rotary Tiller', 'Plough', 'Cultivator', 'Mulching', 'Sprayer', 'Paddyvator', 'Trolley'],
        },
    },

    // ── Existing Mahindra ──
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

    // ── Swaraj ──
    {
        id: 108,
        name: 'Swaraj Target 630',
        category: 'Tractor',
        specs: '29 HP • Yanmar DI • 9F+3R • Oil Immersed Brakes • ADDC',
        price: '₹5,00,000',
        image: 'https://images.unsplash.com/photo-1592805723127-004b174a1d03?w=400&h=300&fit=crop',
        brand: 'Swaraj',
        hp: '29',
        warranty: '5 Years',
        fuelType: 'Diesel',
        features: {
            torqueNm: 87, rpm: 2800, cylinders: 3, displacementCc: 1331,
            engineType: 'Yanmar / Liquid Cooled, Direct Injection',
            gears: '9F+3R', transmission: 'Mechanical Synchromesh',
            brakes: 'Oil Immersed', ptoSpeed: '540/540E', ptoPowerKw: 17.9,
            hydraulicsControl: 'ADDC', maxLiftKgf: 980, hitchFlowLpm: 22,
            axleType: '4WD Portal', steeringType: 'Balanced Power Steering',
            wheelbaseMm: 1555, weightKg: 975, turningRadiusM: 2.1,
            fuelTankL: 27, groundClearanceMm: 303,
            applications: ['Grapes', 'Pomegranate', 'Sugarcane', 'Cotton'],
            usps: ['Narrowest FlexiTrack (3ft width)', 'MaxLift 980kgf', 'Powerful DI Engine 87Nm'],
        },
    },
    {
        id: 3,
        name: 'Swaraj 855 FE',
        category: 'Tractor',
        specs: '52 HP • Oil Immersed Brakes • 4WD',
        price: '₹9,10,000',
        image: 'https://images.unsplash.com/photo-1592805723127-004b174a1d03?w=400&h=300&fit=crop',
        brand: 'Swaraj',
        hp: '52',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },

    // ── Other Brands ──
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
        id: 4,
        name: 'Sonalika Tiger DI 60',
        category: 'Tractor',
        specs: '60 HP • Multi Speed PTO • Hydraulic',
        price: '₹9,10,000',
        image: 'https://images.unsplash.com/photo-1589771145485-d2e7e9b9de35?w=400&h=300&fit=crop',
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
        image: 'https://images.pexels.com/photos/2332736/pexels-photo-2332736.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
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
        image: 'https://images.pexels.com/photos/4394883/pexels-photo-4394883.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
        brand: 'Kubota',
        hp: '45',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },
];

// ─── Mahindra Banner Slides ───
const mahindraSlides: BannerSlide[] = [
    {
        // Mahindra OJA tractor — red tractor in field
        image: '/images/machinery/banners/mahindra-oja.jpg',
        title: 'Power That Makes\nEvery Target Possible',
        subtitle: 'Mahindra OJA Series — Truly Multi-purpose for Sugarcane, Cotton, Orchard & Banana. 21 HP to 40 HP with 3 revolutionary tech packs.',
        cta: 'Explore OJA Range',
        gradient: 'from-red-800 via-red-900 to-gray-950',
        stats: [
            { label: 'HP Range', value: '21', suffix: '-40' },
            { label: 'Models', value: '7', suffix: '+' },
            { label: 'Warranty', value: '5', suffix: ' Yrs' },
        ],
        tags: ['ROBOJA', 'PROJA', 'MYOJA'],
        features: [
            { icon: 'manufacturing', label: 'Engine' },
            { icon: 'settings', label: 'Transmission' },
            { icon: 'water_drop', label: 'Hydraulics' },
            { icon: 'agriculture', label: 'Implements' },
        ],
    },
    {
        // Mahindra OJA 3136 — tech pack showcase
        image: '/images/machinery/banners/mahindra-tech.jpg',
        title: '3 Revolutionary\nTech Packs',
        subtitle: 'ROBOJA (Automation) • PROJA (Productivity) • MYOJA (Smart Monitoring) — Auto PTO, Live Location & Diesel Monitoring.',
        cta: 'View Tech Packs',
        gradient: 'from-gray-950 via-gray-900 to-red-950',
        stats: [
            { label: 'Auto PTO', value: '100', suffix: '%' },
            { label: 'Monitoring', value: '24', suffix: '/7' },
            { label: 'Fuel Save', value: '15', suffix: '%' },
        ],
        tags: ['Automation', 'Smart', 'Connected'],
        features: [
            { icon: 'smart_toy', label: 'Auto PTO' },
            { icon: 'location_on', label: 'Live GPS' },
            { icon: 'local_gas_station', label: 'Fuel Mon.' },
            { icon: 'speed', label: 'Smart Dash' },
        ],
    },
    {
        // Mahindra Yuvo 575 DI — tractor in farmland
        image: '/images/machinery/banners/mahindra-yuvo.jpg',
        title: 'Yuvo 575 DI\n45 HP Workhorse',
        subtitle: '4 Cylinder, 4WD, Power Steering with industry leading 6 Year warranty. Starting ₹7,20,000.',
        cta: 'Get On-Road Price',
        gradient: 'from-red-900 via-red-800 to-orange-950',
        stats: [
            { label: 'Power', value: '45', suffix: ' HP' },
            { label: 'Cylinders', value: '4', suffix: '' },
            { label: 'Warranty', value: '6', suffix: ' Yrs' },
        ],
        tags: ['4WD', 'Power Steering', 'Best Seller'],
        features: [
            { icon: 'bolt', label: '45 HP' },
            { icon: 'change_circle', label: '4WD' },
            { icon: 'swap_driving_apps_wheel', label: 'Power Steer' },
            { icon: 'verified', label: '6 Yr Warranty' },
        ],
    },
    {
        // Swaraj Target 630 — tractor in green field
        image: '/images/machinery/banners/swaraj-target.jpg',
        title: 'Swaraj Target 630\nCompact Powerhouse',
        subtitle: '29 HP Yanmar DI Engine, 9F+3R Gears, Oil Immersed Brakes with ADDC Hydraulics. Built for orchard & inter-crop work.',
        cta: 'View Swaraj Range',
        gradient: 'from-green-900 via-green-800 to-gray-950',
        stats: [
            { label: 'Power', value: '29', suffix: ' HP' },
            { label: 'Gears', value: '9', suffix: 'F+3R' },
            { label: 'Brakes', value: '100', suffix: '%' },
        ],
        tags: ['Compact', 'Orchard', 'Yanmar DI'],
        features: [
            { icon: 'manufacturing', label: 'Yanmar DI' },
            { icon: 'oil_barrel', label: 'Oil Brakes' },
            { icon: 'water_drop', label: 'ADDC Hyd.' },
            { icon: 'park', label: 'Orchard Ready' },
        ],
    },
];

// Brand filter options extracted from data
const allBrands = [...new Set(newTractors.map(t => t.brand))].sort();

export default function NewTractorsPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [brandFilter, setBrandFilter] = useState('All');
    const [hpFilter, setHpFilter] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All');
    const [sortBy, setSortBy] = useState('popular');
    const [priceModalItem, setPriceModalItem] = useState<{ name: string; price: string } | null>(null);
    const listingRef = useRef<HTMLDivElement>(null);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const removeFromCompare = (index: number) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    // Filtered & sorted tractors
    const filteredTractors = useMemo(() => {
        let list = [...newTractors];

        if (brandFilter !== 'All') list = list.filter(t => t.brand === brandFilter);

        if (hpFilter !== 'All') {
            const [min, max] = hpFilter === '65+' ? [65, 999] : hpFilter.split('-').map(Number);
            list = list.filter(t => { const hp = parseInt(t.hp); return hp >= min && hp <= max; });
        }

        if (priceFilter !== 'All') {
            const price = (t: typeof newTractors[0]) => parseInt(t.price.replace(/[₹,\s]/g, ''));
            if (priceFilter === 'Under ₹5L') list = list.filter(t => price(t) < 500000);
            else if (priceFilter === '₹5-8L') list = list.filter(t => { const p = price(t); return p >= 500000 && p <= 800000; });
            else if (priceFilter === '₹8-12L') list = list.filter(t => { const p = price(t); return p >= 800000 && p <= 1200000; });
            else if (priceFilter === 'Above ₹12L') list = list.filter(t => price(t) > 1200000);
        }

        if (sortBy === 'price-low') list.sort((a, b) => parseInt(a.price.replace(/[₹,\s]/g, '')) - parseInt(b.price.replace(/[₹,\s]/g, '')));
        else if (sortBy === 'price-high') list.sort((a, b) => parseInt(b.price.replace(/[₹,\s]/g, '')) - parseInt(a.price.replace(/[₹,\s]/g, '')));
        else if (sortBy === 'hp-high') list.sort((a, b) => parseInt(b.hp) - parseInt(a.hp));

        return list;
    }, [brandFilter, hpFilter, priceFilter, sortBy]);

    const compareItems = newTractors.filter(item => selectedItems.includes(item.id));

    const scrollToListing = () => {
        listingRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Add ctaAction to slides
    const slides = mahindraSlides.map(s => ({ ...s, ctaAction: scrollToListing }));

    return (
        <div className="px-3 sm:px-6">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="tractors" currentAction="new" />

                {/* ── Mahindra Hero Banner ── */}
                <BrandBanner brand="Featured Tractors" slides={slides} autoPlayInterval={6000} />

                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New Tractors</h1>
                    <p className="text-gray-500">
                        Browse {filteredTractors.length} brand new tractors with manufacturer warranty. Get on-road price instantly.
                    </p>
                </div>

                {/* ── Tech Packs Info Strip (for Mahindra OJA) ── */}
                <div className="mb-6 flex flex-wrap gap-3">
                    {[
                        { name: 'ROBOJA', color: 'bg-red-500', desc: 'Automation — Auto PTO, Auto Implement Lift, Auto Braking' },
                        { name: 'PROJA', color: 'bg-blue-600', desc: 'Productivity — 3DI Engine, ePTO, F/R Shuttle, Creeper' },
                        { name: 'MYOJA', color: 'bg-purple-600', desc: 'Monitoring — Live Location, Diesel Monitor, Service Alerts' },
                    ].map(tp => (
                        <div key={tp.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <span className={`w-2.5 h-2.5 rounded-full ${tp.color}`} />
                            <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{tp.name}</span>
                            <span className="text-[10px] text-gray-500 hidden sm:inline">— {tp.desc}</span>
                        </div>
                    ))}
                </div>

                {/* ── Filters Bar ── */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2" ref={listingRef}>
                    <select
                        value={brandFilter}
                        onChange={e => setBrandFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm"
                    >
                        <option value="All">All Brands</option>
                        {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select
                        value={hpFilter}
                        onChange={e => setHpFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm"
                    >
                        <option value="All">HP Range</option>
                        <option value="20-30">20-30 HP</option>
                        <option value="30-40">30-40 HP</option>
                        <option value="40-50">40-50 HP</option>
                        <option value="50-60">50-60 HP</option>
                        <option value="65+">65+ HP</option>
                    </select>
                    <select
                        value={priceFilter}
                        onChange={e => setPriceFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm"
                    >
                        <option value="All">Price Range</option>
                        <option value="Under ₹5L">Under ₹5 Lakhs</option>
                        <option value="₹5-8L">₹5-8 Lakhs</option>
                        <option value="₹8-12L">₹8-12 Lakhs</option>
                        <option value="Above ₹12L">Above ₹12 Lakhs</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2 shrink-0">
                        <span className="text-sm text-gray-500">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm"
                        >
                            <option value="popular">Popular</option>
                            <option value="price-low">Price: Low → High</option>
                            <option value="price-high">Price: High → Low</option>
                            <option value="hp-high">HP: High → Low</option>
                        </select>
                    </div>
                </div>

                <CompareSection
                    items={compareItems}
                    onRemove={removeFromCompare}
                    onCompare={() => setShowCompareModal(true)}
                    onSlotClick={scrollToListing}
                />

                {/* Listing */}
                <MachineryListing
                    items={filteredTractors}
                    type="new"
                    onCompare={toggleSelection}
                    selectedForCompare={selectedItems}
                    onGetPrice={(item) => setPriceModalItem({ name: item.name, price: item.price })}
                />

                {/* Compare Modal */}
                <CompareModal
                    isOpen={showCompareModal}
                    onClose={() => setShowCompareModal(false)}
                    items={compareItems}
                />

                {/* On-Road Price Modal */}
                {priceModalItem && (
                    <PriceByState
                        basePrice={priceModalItem.price}
                        modelName={priceModalItem.name}
                        onClose={() => setPriceModalItem(null)}
                    />
                )}
            </div>
        </div>
    );
}

