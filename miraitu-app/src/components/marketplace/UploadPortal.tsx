'use client';

import { useState } from 'react';

type UploadType = 'transportation' | 'storage';
type VehicleType = 'truck' | 'tractor' | 'car' | 'others';
type StorageType = 'cold-storage' | 'godown';

export default function UploadPortal() {
    const [activeUpload, setActiveUpload] = useState<UploadType>('transportation');
    const [vehicleType, setVehicleType] = useState<VehicleType>('truck');
    const [storageType, setStorageType] = useState<StorageType>('cold-storage');
    const [images, setImages] = useState<File[]>([]);

    const handleImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setImages(prev => [...prev, ...files]);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary-dark mb-2">Upload Portal</h1>
                    <p className="text-soil-dark">List your transport and storage assets to the community</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-xl bg-[#fbfaf9] shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] font-bold text-primary-dark transition-all">
                        Listings
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_3px_0_0_#1a3617] hover:shadow-[0_1px_0_0_#1a3617] active:translate-y-1 transition-all">
                        New Upload
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transportation Upload */}
                <div className="p-6 rounded-2xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff]">
                    <h3 className="text-xl font-bold text-primary-dark mb-2 flex items-center gap-2">
                        <span className="text-2xl">🚚</span>
                        Transportation Upload
                    </h3>
                    <p className="text-sm text-soil-dark mb-6">List your vehicle for transport services</p>

                    {/* Vehicle Type Selection */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-soil-dark mb-3 block uppercase">Select Vehicle Type</label>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { type: 'truck' as VehicleType, icon: '🚛', label: 'Truck' },
                                { type: 'tractor' as VehicleType, icon: '🚜', label: 'Tractor' },
                                { type: 'car' as VehicleType, icon: '🚗', label: 'Car' },
                                { type: 'others' as VehicleType, icon: '⋯', label: 'Others' },
                            ].map(v => (
                                <button
                                    key={v.type}
                                    onClick={() => setVehicleType(v.type)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold transition-all ${vehicleType === v.type
                                            ? 'bg-[#dce8d5] shadow-[inset_3px_3px_6px_#c8d4c0,inset_-3px_-3px_6px_#f0f8e8] text-primary-dark'
                                            : 'bg-white shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] text-soil-dark'
                                        }`}
                                >
                                    <span className="text-2xl">{v.icon}</span>
                                    <span className="text-xs">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Vehicle Photos */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-soil-dark mb-3 block uppercase">Vehicle Photos</label>
                        <div
                            onDrop={handleImageDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="relative p-8 rounded-2xl border-2 border-dashed border-primary/30 bg-[#f8f9f6] hover:border-primary/50 transition-colors cursor-pointer"
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-primary">photo_camera</span>
                                </div>
                                <p className="font-bold text-primary-dark mb-1">Drag & Drop or Click to Upload</p>
                                <p className="text-xs text-soil-dark">PNG, JPG up to 10 MB</p>
                            </div>
                        </div>
                        {images.length > 0 && (
                            <p className="text-sm text-primary font-bold mt-2">{images.length} file(s) selected</p>
                        )}
                    </div>

                    {/* Vehicle Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-sm font-bold text-soil-dark mb-2 block">Vehicle Model</label>
                            <input
                                type="text"
                                placeholder="e.g. Tata Ultra 1518"
                                className="w-full px-4 py-3 rounded-xl bg-white shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-soil-dark mb-2 block">Reg. Number</label>
                            <input
                                type="text"
                                placeholder="PH-10-XX-0000"
                                className="w-full px-4 py-3 rounded-xl bg-white shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/50"
                            />
                        </div>
                    </div>

                    <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_4px_0_0_#1a3617] hover:shadow-[0_2px_0_0_#1a3617] active:translate-y-1 transition-all">
                        SUBMIT TRANSPORT LISTING
                    </button>
                </div>

                {/* Storage Upload */}
                <div className="p-6 rounded-2xl bg-[#fbfaf9] shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff]">
                    <h3 className="text-xl font-bold text-primary-dark mb-2 flex items-center gap-2">
                        <span className="text-2xl">🏭</span>
                        Storage Upload
                    </h3>
                    <p className="text-sm text-soil-dark mb-6">List your storage facility</p>

                    {/* Storage Type */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-soil-dark mb-3 block uppercase">Storage Category</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setStorageType('cold-storage')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold transition-all ${storageType === 'cold-storage'
                                        ? 'bg-[#dce8d5] shadow-[inset_3px_3px_6px_#c8d4c0,inset_-3px_-3px_6px_#f0f8e8] text-primary-dark border-2 border-primary'
                                        : 'bg-white shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] text-soil-dark'
                                    }`}
                            >
                                <span className="text-2xl">❄️</span>
                                <div className="text-center">
                                    <div className="text-sm">Cold Storage</div>
                                    <div className="text-xs text-soil-dark/70">Perishables</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setStorageType('godown')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold transition-all ${storageType === 'godown'
                                        ? 'bg-[#dce8d5] shadow-[inset_3px_3px_6px_#c8d4c0,inset_-3px_-3px_6px_#f0f8e8] text-primary-dark border-2 border-primary'
                                        : 'bg-white shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] text-soil-dark'
                                    }`}
                            >
                                <span className="text-2xl">🏭</span>
                                <div className="text-center">
                                    <div className="text-sm">Godown</div>
                                    <div className="text-xs text-soil-dark/70">Dry Storage</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Location Selector */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-soil-dark mb-2 block">📍 Location Selector</label>
                        <input
                            type="text"
                            placeholder="Ludhiana, Punjab"
                            className="w-full px-4 py-3 rounded-xl bg-white shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/50"
                        />
                    </div>

                    {/* Capacity & Area */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-sm font-bold text-soil-dark mb-2 block">Capacity (in Quintals)</label>
                            <input
                                type="text"
                                placeholder="e.g. 5000"
                                className="w-full px-4 py-3 rounded-xl bg-white shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-soil-dark mb-2 block">Area (Sq. Ft)</label>
                            <input
                                type="text"
                                placeholder="e.g. 10000"
                                className="w-full px-4 py-3 rounded-xl bg-white shadow-[inset_2px_2px_4px_#d4d9ce,inset_-2px_-2px_4px_#ffffff] border border-[#e0e5df]/50 outline-none font-medium text-primary-dark placeholder:text-soil-dark/50"
                            />
                        </div>
                    </div>

                    {/* Features & Pricing */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-soil-dark mb-3 block uppercase">Features & Pricing</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 rounded border-2 border-primary/30 text-primary" />
                                <span className="text-sm font-medium text-soil-dark">24/7 Security</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-2 border-primary/30 text-primary" />
                                <span className="text-sm font-medium text-soil-dark">CCTV Monitoring</span>
                            </label>
                        </div>
                    </div>

                    {/* Base Rate */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-soil-dark mb-3 block uppercase">Base Rate Per Day</label>
                        <div className="flex items-center gap-2 px-4 py-4 rounded-xl bg-[#e8eede] border-2 border-primary/20">
                            <span className="text-3xl font-black text-primary">₹</span>
                            <input
                                type="text"
                                placeholder="450"
                                className="flex-1 bg-transparent outline-none text-2xl font-black text-primary placeholder:text-primary/50"
                            />
                        </div>
                    </div>

                    <button className="w-full px-6 py-4 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_4px_0_0_#1a3617] hover:shadow-[0_2px_0_0_#1a3617] active:translate-y-1 transition-all">
                        SUBMIT STORAGE LISTING
                    </button>
                </div>
            </div>
        </div>
    );
}
