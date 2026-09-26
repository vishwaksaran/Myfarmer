'use client';

import SellerWorkspace, { type WorkspaceConfig } from '@/components/seller/SellerWorkspace';

/**
 * A dealer stocks machinery, vehicles, inputs and spares rather than growing
 * anything, so the category list leads with equipment and the postings are
 * called products.
 *
 * This screen was a mock-up until now: hardcoded counters, four Quick Action
 * tiles with no handlers, a fake "#MRT-0000" order row, and the public
 * storefront header with a Login button on top. It shares the real workspace
 * with the other seller types now — see SellerWorkspace.
 */
const config: WorkspaceConfig = {
    title: 'Dealer Dashboard',
    noun: 'Products',
    nounSingular: 'Product',
    approvedBlurb:
        'You are verified. Anything you list here goes straight onto the Miraitu boards where farmers are looking.',
    categories: [
        { value: 'machinery', label: 'Machinery & equipment' },
        { value: 'vehicles', label: 'Vehicles' },
        { value: 'crops', label: 'Seeds & produce' },
        { value: 'animals', label: 'Livestock' },
        { value: 'other', label: 'Other products' },
    ],
    priceUnits: ['Total', 'per piece', 'per kg', 'per quintal', 'per litre'],
};

export default function DealerDashboardPage() {
    return <SellerWorkspace config={config} />;
}
