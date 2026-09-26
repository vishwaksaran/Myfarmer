'use client';

import SellerWorkspace, { type WorkspaceConfig } from '@/components/seller/SellerWorkspace';

/**
 * A farmer sells what they grow and raise, and sometimes a machine they no
 * longer need. Everything else about this screen is shared — see
 * SellerWorkspace.
 */
const config: WorkspaceConfig = {
    title: 'Farmer Dashboard',
    noun: 'Listings',
    nounSingular: 'Listing',
    approvedBlurb:
        'You are verified. Anything you list here goes straight onto the Miraitu boards where buyers are looking.',
    categories: [
        { value: 'crops', label: 'Crops, vegetables & fruits' },
        { value: 'animals', label: 'Livestock' },
        { value: 'machinery', label: 'Machinery & equipment' },
    ],
    priceUnits: ['per quintal', 'per kg', 'per piece', 'per litre', 'Total'],
};

export default function FarmerDashboardPage() {
    return <SellerWorkspace config={config} />;
}
