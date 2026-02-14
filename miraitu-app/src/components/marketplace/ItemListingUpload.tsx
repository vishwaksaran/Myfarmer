'use client';

import { useState } from 'react';

// Category-specific field configurations
const categoryFields: Record<string, { label: string; placeholder: string; unit: string; icon: string; type?: string; options?: string[] }> = {
    'Livestock': { label: 'Number of Animals', placeholder: 'e.g. 5', unit: 'Head', icon: 'pets', type: 'number' },
    'Machinery': { label: 'Horsepower / Capacity', placeholder: 'e.g. 45', unit: 'HP', icon: 'speed' },
    'Agricultural Products': { label: 'Quantity', placeholder: 'e.g. 50', unit: 'Quintals', icon: 'scale', options: ['Kg', 'Quintals', 'Tonnes', 'Bags'] },
    'Farmer Land': { label: 'Land Area', placeholder: 'e.g. 5', unit: 'Acres', icon: 'landscape', options: ['Acres', 'Hectares', 'Bigha', 'Guntha'] },
    'Crops': { label: 'Quantity Available', placeholder: 'e.g. 100', unit: 'Kg', icon: 'eco', options: ['Kg', 'Quintals', 'Tonnes', 'Bags'] },
};

// Category type configurations
const categoryTypes: Record<string, string[]> = {
    'Livestock': ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Horse', 'Others'],
    'Machinery': ['Tractor', 'JCB', 'Harvester', 'Drone', 'Implement', 'Small Machinery'],
    'Agricultural Products': ['Grains', 'Pulses', 'Oilseeds', 'Spices', 'Fertilizers', 'Pesticides', 'Seeds'],
    'Farmer Land': ['Agricultural Land', 'Farm House', 'Orchard', 'Irrigated Land', 'Dry Land', 'Wasteland'],
    'Crops': ['Food Grains', 'Vegetables', 'Fruits', 'Spices', 'Cash Crops', 'Flowers', 'Medicinal Herbs'],
};

export default function ItemListingUpload() {
    const [images, setImages] = useState<File[]>([]);
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('Livestock');
    const [subType, setSubType] = useState('');
    const [dynamicValue, setDynamicValue] = useState('');
    const [dynamicUnit, setDynamicUnit] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [featureListing, setFeatureListing] = useState(false);

    const categories = ['Livestock', 'Machinery', 'Agricultural Products', 'Farmer Land', 'Crops'];
    const currentField = categoryFields[category];
    const currentTypes = categoryTypes[category] || [];

    // Reset sub fields when category changes
    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        setSubType('');
        setDynamicValue('');
        setDynamicUnit(categoryFields[newCategory]?.unit || '');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setImages(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-primary-dark mb-6">Create New Listing</h2>

            <div className="p-8 rounded-2xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff]">
                {/* Item Images */}
                <div className="mb-6">
                    <label className="text-sm font-bold text-soil-dark mb-3 block uppercase tracking-wide">Item Images</label>
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="relative p-12 rounded-2xl border-2 border-dashed border-primary/30 bg-[#f8fdf2] hover:border-primary/50 hover:bg-[#f0fae6] transition-all cursor-pointer"
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                                <span className="material-symbols-outlined text-5xl text-primary">folder</span>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-lg">add</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-primary-dark mb-2">Drag and drop photos</h3>
                            <p className="text-sm text-soil-dark mb-1">or click to browse from your device</p>
                            <p className="text-xs text-soil-dark/70">JPG • PNG • MAX 10MB</p>
                        </div>
                    </div>
                    {images.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {images.map((img, idx) => (
                                <div key={idx} className="px-3 py-1 rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    {img.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Item Name and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="text-sm font-bold text-soil-dark mb-2 block">Item Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Purebred Holstein Friesian"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/80 shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/40 focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-soil-dark mb-2 block">Category</label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/80 shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark cursor-pointer focus:border-primary/50 transition-colors appearance-none pr-10"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                                expand_more
                            </span>
                        </div>
                    </div>
                </div>

                {/* Type and Category-Specific Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Type Dropdown (changes per category) */}
                    <div>
                        <label className="text-sm font-bold text-soil-dark mb-2 block">Type</label>
                        <div className="relative">
                            <select
                                value={subType}
                                onChange={(e) => setSubType(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/80 shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark cursor-pointer focus:border-primary/50 transition-colors appearance-none pr-10"
                            >
                                <option value="">Select Type</option>
                                {currentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* Dynamic Category-Specific Field */}
                    {currentField && (
                        <div>
                            <label className="text-sm font-bold text-soil-dark mb-2 block">{currentField.label}</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60">
                                    {currentField.icon}
                                </span>
                                <input
                                    type={currentField.type || 'text'}
                                    inputMode="decimal"
                                    placeholder={currentField.placeholder}
                                    value={dynamicValue}
                                    onChange={(e) => setDynamicValue(e.target.value)}
                                    className="w-full pl-11 pr-28 py-3 rounded-xl bg-white/80 shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/40 focus:border-primary/50 transition-colors"
                                />
                                {/* Unit selector or label on the right */}
                                {currentField.options ? (
                                    <select
                                        value={dynamicUnit || currentField.unit}
                                        onChange={(e) => setDynamicUnit(e.target.value)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold border-none outline-none cursor-pointer appearance-none"
                                    >
                                        {currentField.options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary/60">
                                        {currentField.unit}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Price and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="text-sm font-bold text-soil-dark mb-2 block">Price (KES)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">Ksh</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Enter amount"
                                value={price}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                        setPrice(val);
                                    }
                                }}
                                style={{ outline: 'none' }}
                                className="w-full pl-14 pr-4 py-3 rounded-xl bg-[#e8f5e0] shadow-[inset_2px_2px_4px_#c8d4c0,inset_-2px_-2px_4px_#f0f8e8] border-2 border-transparent !outline-none font-bold text-primary placeholder:text-primary/40 transition-all duration-300 appearance-none focus:border-primary focus:shadow-[inset_2px_2px_4px_#c8d4c0,inset_-2px_-2px_4px_#f0f8e8,0_0_0_3px_rgba(44,89,38,0.15)] focus:ring-0 focus-visible:border-primary focus-visible:ring-0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-soil-dark mb-2 block">Location Picker</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">location_on</span>
                            <input
                                type="text"
                                placeholder="Select your farm location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/40 focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label className="text-sm font-bold text-soil-dark mb-2 block">Description</label>
                    <textarea
                        placeholder="Describe the health, age, breed, and history of the item..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-white/80 shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/40 resize-none focus:border-primary/50 transition-colors"
                    />
                </div>

                {/* Feature Listing */}
                <div className="mb-8 p-4 rounded-xl bg-[#f0fae6] border border-primary/20">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={featureListing}
                                onChange={(e) => setFeatureListing(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-300 rounded-full peer-checked:bg-primary transition-colors"></div>
                            <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-7"></div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">star</span>
                                <span className="font-bold text-primary-dark">Feature this Listing</span>
                            </div>
                            <p className="text-xs text-soil-dark mt-1">Your item will appear at the top of search results</p>
                        </div>
                    </label>
                </div>

                {/* Submit Button */}
                <button className="w-full px-8 py-4 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_4px_0_0_#1a3617] hover:shadow-[0_2px_0_0_#1a3617] active:translate-y-1 transition-all text-lg flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">publish</span>
                    Publish Listing
                </button>
            </div>
        </div>
    );
}
