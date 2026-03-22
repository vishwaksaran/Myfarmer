'use server';

import {
    getAllBrands,
    getPopularModels,
    getLatestModels,
    getModelsByBudget,
    getModelsByHP,
    getModelsByBrand,
    getModelBySlug,
    getBrandBySlug,
    getPopularComparisons,
    getActiveBanners,
    getSimilarModels,
    getModelsByDriveType,
    getAllModels,
} from '@/lib/machinery-db';

export async function fetchBrands(tier?: number) {
    return getAllBrands(tier);
}

export async function fetchPopularModels(limit?: number) {
    return getPopularModels(limit);
}

export async function fetchLatestModels(limit?: number) {
    return getLatestModels(limit);
}

export async function fetchModelsByBudget(minPrice: number, maxPrice: number) {
    return getModelsByBudget(minPrice, maxPrice);
}

export async function fetchModelsByHP(minHP: number, maxHP: number) {
    return getModelsByHP(minHP, maxHP);
}

export async function fetchModelsByBrand(brand: string) {
    return getModelsByBrand(brand);
}

export async function fetchModelBySlug(slug: string) {
    return getModelBySlug(slug);
}

export async function fetchBrandBySlug(slug: string) {
    return getBrandBySlug(slug);
}

export async function fetchPopularComparisons(limit?: number) {
    return getPopularComparisons(limit);
}

export async function fetchBanners(placement?: string) {
    return getActiveBanners(placement);
}

export async function fetchSimilarModels(modelId: string, brand: string, hp: number, limit?: number) {
    return getSimilarModels(modelId, brand, hp, limit);
}

export async function fetchModelsByDriveType(driveType: string) {
    return getModelsByDriveType(driveType);
}

export async function fetchAllTractors() {
    return getAllModels('Tractor');
}
