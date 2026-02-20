import { redirect } from 'next/navigation';

/**
 * Redirect /home to / for backwards compatibility.
 * All home content now lives at the root route.
 */
export default function HomeRedirectPage() {
    redirect('/');
}
