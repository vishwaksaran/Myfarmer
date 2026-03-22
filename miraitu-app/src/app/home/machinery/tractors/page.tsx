import TractorHubPage from './hub-page';
import {
    getAllBrands,
    getPopularModels,
    getLatestModels,
    getPopularComparisons,
    getActiveBanners,
    getAllModels,
} from '@/lib/machinery-db';

export default async function TractorsPage() {
    const [brands, popularModels, latestModels, comparisons, banners, allModels] = await Promise.all([
        getAllBrands(),
        getPopularModels(12),
        getLatestModels(8),
        getPopularComparisons(10),
        getActiveBanners('tractor-hub'),
        getAllModels('Tractor'),
    ]);

    return (
        <TractorHubPage
            brands={brands}
            popularModels={popularModels}
            latestModels={latestModels}
            comparisons={comparisons}
            banners={banners}
            allModels={allModels}
        />
    );
}
