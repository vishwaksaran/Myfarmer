'use client';

import ListingsBoard from '@/components/listings/ListingsBoard';

/**
 * Labour & Services — people offering their own work, by the hour, day or job.
 *
 * The third board alongside Rent and Buy & Sell. It is its own `listing_mode`
 * rather than a slice of Rent so a harvest crew never turns up among the
 * tractors: the three boards' categories are disjoint by construction.
 */
export default function LabourServicesPage() {
    return <ListingsBoard mode="labour" />;
}
