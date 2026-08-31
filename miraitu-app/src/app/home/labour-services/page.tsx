'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import ListingFormModal from '@/components/listings/ListingFormModal';
import { submitBooking } from '@/app/actions/bookings';
import { CATEGORY_META } from '@/components/listings/listingFormat';
import type { ListingInput } from '@/components/listings/listingTypes';

/**
 * Labour & Services — people offering their own work, by the hour, day or job.
 *
 * Deliberately NOT a public board. What a farmer submits here is a lead for the
 * Miraitu team, not an ad other farmers browse: it goes to `service_bookings`
 * under module 'farm-labour' and surfaces in Admin → Bookings → Farm Labours.
 * Nothing is published back to the app, so the page has no list — it opens
 * straight into the form and ends on a thank-you.
 *
 * The form itself is the shared ListingFormModal in `labour` mode, which is
 * where the Work type / Number of workers / Your Name fields and the two
 * categories come from.
 */
export default function LabourServicesPage() {
    const router = useRouter();
    const [done, setDone] = useState(false);
    // The form calls onClose() after a successful save as well as on cancel.
    // Read through a ref rather than `done`, because that close fires in the
    // same tick as the state update — the closure would still see `false` and
    // navigate away from the thank-you the user is meant to land on.
    const submittedRef = useRef(false);

    const handleSubmit = async (input: ListingInput) => {
        const res = await submitBooking({
            module: 'farm-labour',
            category: input.category,
            full_name: input.contactName?.trim() || '',
            phone: input.contactPhone?.trim() || '',
            location: input.location,
            extra_data: {
                offering: CATEGORY_META[input.category]?.label ?? input.category,
                work_type: input.workType?.trim() || '',
                subcategory: input.subcategory || '',
                title: input.title.trim(),
                description: input.description?.trim() || '',
                worker_count: input.workerCount ?? '',
                price: input.price ?? '',
                price_unit: input.priceUnit ?? '',
                photos: input.images ?? [],
                district: input.district ?? '',
                state: input.state ?? '',
            },
            user_latitude: input.latitude ?? undefined,
            user_longitude: input.longitude ?? undefined,
        });

        if (!res.success) return { success: false, error: res.error };
        submittedRef.current = true;
        setDone(true);
        return { success: true };
    };

    if (done) {
        return (
            <div className="px-4 md:px-6 py-16">
                <div className="mx-auto max-w-md text-center bg-white dark:bg-[#1a231a] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#22c33d]/10 mb-4">
                        <span
                            className="material-symbols-outlined text-[#22c33d] text-4xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            task_alt
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                        Thanks for registering!
                    </h1>
                    <p className="text-gray-500 mb-4 leading-relaxed">
                        Your registration has been received. Our team is reviewing your details
                        and will get in touch shortly with an update on the work you offer.
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                        Please keep your phone reachable — we will call you on the number you
                        registered with.
                    </p>
                    <Link
                        href="/home"
                        className="inline-block w-full py-3 rounded-xl bg-[#22c33d] text-white font-bold"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <ListingFormModal
            isOpen
            mode="labour"
            onClose={() => { if (!submittedRef.current) router.back(); }}
            onSubmit={handleSubmit}
        />
    );
}
