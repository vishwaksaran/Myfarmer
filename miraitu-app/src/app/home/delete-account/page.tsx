import type { Metadata } from 'next';
import Link from 'next/link';
import MiraituLogo from '@/components/MiraituLogo';

/**
 * The public account-deletion page.
 *
 * Google Play requires any app with accounts to offer deletion in two
 * places: inside the app, and at a web page someone can reach *without*
 * installing it. Miraitu already had the first (Settings → Delete Account)
 * but not the second, which is the URL declared in the Data Safety form.
 *
 * Deliberately a server component with no auth, no header and no app
 * chrome. A reviewer opens this cold, signed out, possibly on a desktop,
 * and it has to render and answer the question immediately. Anything that
 * redirects to a login fails the check.
 */

export const metadata: Metadata = {
    title: 'Delete Your Account – Miraitu',
    description:
        'How to delete your Miraitu account and the data held with it, from inside the app or by request.',
    alternates: { canonical: 'https://www.miraitu.in/home/delete-account' },
    robots: { index: true, follow: true },
};

const REMOVED = [
    'Your name, mobile number, email address and profile details',
    'Your listings for crops, livestock, machinery and land, which stop appearing on Miraitu',
    'Photographs you uploaded with those listings',
    'Callback requests and buying requirements you submitted',
    'Your seller application and any seller login issued to you',
    'Saved addresses, preferences and your app language setting',
];

const KEPT = [
    {
        what: 'Transaction and order records',
        why: 'Indian tax and accounting law requires these to be retained for a fixed period. They are kept in a restricted form and are not used to contact you.',
    },
    {
        what: 'Records needed for a live dispute or legal claim',
        why: 'Kept only until the matter is resolved, then deleted on the same basis as everything else.',
    },
    {
        what: 'Anonymised and aggregated statistics',
        why: 'These carry no name, number or identifier and cannot be traced back to you.',
    },
];

export default function DeleteAccountPage() {
    return (
        <div className="min-h-screen bg-white text-gray-800">
            <header className="bg-gradient-to-r from-[#1a3617] to-[#2c5926] text-white py-10 px-6">
                <div className="mx-auto max-w-3xl">
                    <Link href="/home" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-5 transition-colors">
                        <MiraituLogo size={26} />
                        <span>Miraitu</span>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black">Delete Your Account</h1>
                    <p className="text-white/80 mt-2 text-sm leading-relaxed max-w-2xl">
                        This page explains how to delete your Miraitu account and the data held
                        with it. It applies to the Miraitu Android app
                        (<code className="text-white/90">com.miraitu.app</code>) and to miraitu.in.
                    </p>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-6 py-12 space-y-10 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-[#1a3617] mb-4">Two ways to delete your account</h2>

                    <div className="rounded-2xl border border-gray-200 p-5 mb-4">
                        <h3 className="font-bold text-[#2c5926] mb-2">1. From inside the app or website</h3>
                        <ol className="list-decimal pl-6 space-y-1.5">
                            <li>Sign in to Miraitu.</li>
                            <li>Open <strong>Settings</strong>.</li>
                            <li>Choose <strong>Delete Account</strong> and confirm.</li>
                        </ol>
                        <p className="mt-3 text-sm text-gray-600">
                            Your account is removed straight away and you are signed out on every device.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-5">
                        <h3 className="font-bold text-[#2c5926] mb-2">2. By request, without installing the app</h3>
                        <p>
                            Email{' '}
                            <a href="mailto:miraitutechnologies@gmail.com?subject=Account%20deletion%20request" className="text-[#2c5926] font-semibold underline">
                                miraitutechnologies@gmail.com
                            </a>{' '}
                            with the subject <strong>Account deletion request</strong>, from the email
                            address on your account, or send the registered mobile number you signed up with.
                        </p>
                        <p className="mt-3 text-sm text-gray-600">
                            We verify the request belongs to you before acting on it, then delete the
                            account within <strong>30 days</strong> and confirm by email. We may contact
                            you once to confirm identity; we will never ask for your OTP or password.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-[#1a3617] mb-4">What is deleted</h2>
                    <ul className="list-disc pl-6 space-y-1.5">
                        {REMOVED.map(item => <li key={item}>{item}</li>)}
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-[#1a3617] mb-4">What we have to keep, and why</h2>
                    <p className="mb-3">
                        A small amount of data survives deletion because the law requires it.
                        None of it is used to contact you or to build a profile.
                    </p>
                    <dl className="space-y-3">
                        {KEPT.map(k => (
                            <div key={k.what} className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                                <dt className="font-bold text-gray-900">{k.what}</dt>
                                <dd className="text-sm text-gray-600 mt-1">{k.why}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-[#1a3617] mb-4">Deleting some data without closing your account</h2>
                    <p>
                        You do not have to delete everything. You can remove individual listings from
                        <strong> My Ads</strong>, take a seller listing down from your seller dashboard,
                        or email us to withdraw a specific requirement or callback request. Contact
                        details are the same as above.
                    </p>
                </section>

                <section className="border-t border-gray-200 pt-8">
                    <h2 className="text-xl font-bold text-[#1a3617] mb-3">Contact</h2>
                    <p>
                        Miraitu · <a href="mailto:miraitutechnologies@gmail.com" className="text-[#2c5926] font-semibold underline">miraitutechnologies@gmail.com</a>
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                        See also our{' '}
                        <Link href="/home/privacy-policy" className="text-[#2c5926] font-semibold underline">Privacy Policy</Link>
                        {' '}and{' '}
                        <Link href="/home/terms-of-service" className="text-[#2c5926] font-semibold underline">Terms of Service</Link>.
                    </p>
                </section>
            </main>
        </div>
    );
}
