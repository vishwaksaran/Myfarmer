'use client';

import SellerWorkspace, { type WorkspaceConfig } from '@/components/seller/SellerWorkspace';

/**
 * A service provider sells work rather than goods — drone spraying, borewell
 * drilling, transport, harvest crews — so the categories are services and
 * labour, and the price units are per job or per acre rather than per kilo.
 *
 * Note this is not the same screen as /home/provider-dashboard. That one is
 * the operational view for a provider already taking bookings, reached by
 * switching into provider mode. This is the seller workspace reached from
 * /seller-login, where a provider publishes what they offer.
 */
const config: WorkspaceConfig = {
    title: 'Service Provider Dashboard',
    noun: 'Services',
    nounSingular: 'Service',
    approvedBlurb:
        'You are verified. Anything you list here goes straight onto the Miraitu boards where farmers are looking for help.',
    categories: [
        { value: 'services', label: 'Services offered' },
        { value: 'labour', label: 'Labour & crews' },
        // Hire, not sale — this one goes on the Rent board.
        { value: 'machinery', label: 'Machinery for hire', mode: 'rent' },
    ],
    priceUnits: ['Per job', 'Per acre', 'Per hour', 'One day', 'Per month'],
};

export default function ServiceProviderDashboardPage() {
    return <SellerWorkspace config={config} />;
}
