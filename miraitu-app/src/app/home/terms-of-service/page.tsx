'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a3617] to-[#2c5926] text-white py-12 px-6">
                <div className="mx-auto max-w-4xl">
                    <Link href="/home" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black">Miraitu.in – Complete Legal Bundle</h1>
                    <p className="text-white/70 mt-2 text-sm">Last Updated: 28/03/2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="prose prose-green max-w-none text-gray-700 leading-relaxed space-y-8">

                    {/* Section 1 - Terms of Service */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">1. TERMS OF SERVICE</h2>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.1 Agreement</h3>
                        <p>This Terms of Service (&quot;Terms&quot;) is a legally binding agreement between you (&quot;User&quot;) and Miraitu Technologies Private Limited (CIN: U62099KA2026PTC216873), having its registered office at:</p>
                        <div className="bg-[#f0f7ef] rounded-xl p-4 mt-2 border border-[#2c5926]/10">
                            <p className="font-semibold text-[#1a3617]">No 4A, Vinayaka Layout, Parappana Agrahara, Bengaluru, Karnataka – 560100, India</p>
                            <p className="text-sm text-gray-600 mt-1">(&quot;Company&quot;, &quot;Miraitu&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;)</p>
                        </div>
                        <p className="mt-4">By accessing or using Miraitu.in, you agree to these Terms.</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.2 Nature of Platform</h3>
                        <p>Miraitu.in operates as:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>A digital platform and intermediary</li>
                            <li>A lead generation and information service provider</li>
                            <li>A marketplace facilitator</li>
                        </ul>
                        <p className="mt-3 font-semibold">We do NOT:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Sell vehicles directly</li>
                            <li>Own listed inventory</li>
                            <li>Provide loans directly</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.3 Eligibility</h3>
                        <p>You confirm that:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>You are 18 years or older</li>
                            <li>You are legally capable of entering into contracts</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.4 User Obligations</h3>
                        <p>You agree NOT to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide false or misleading information</li>
                            <li>Upload infringing or illegal content</li>
                            <li>Misuse platform systems or attempt unauthorized access</li>
                        </ul>
                        <p className="mt-3">Violation may lead to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Account suspension/termination</li>
                            <li>Legal action</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.5 Third-Party Transactions</h3>
                        <p>All transactions are between Users and third parties (dealers/lenders).</p>
                        <p className="mt-2">Miraitu:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Is not a party to transactions</li>
                            <li>Does not guarantee product/service quality</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.6 Loan / Finance Clause</h3>
                        <p>Miraitu.in may:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Display loan/EMI options</li>
                            <li>Share your data with RBI-regulated lenders</li>
                            <li>Act as a Lending Service Provider (LSP)</li>
                        </ul>
                        <p className="mt-3">However:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>We do not lend directly</li>
                            <li>Loan approval is solely lender&apos;s decision</li>
                            <li>We are not responsible for:
                                <ul className="list-disc pl-6 mt-1 space-y-1">
                                    <li>Loan rejection</li>
                                    <li>Interest rates</li>
                                    <li>Recovery practices</li>
                                </ul>
                            </li>
                        </ul>
                        <div className="bg-amber-50 rounded-xl p-4 mt-4 border border-amber-200">
                            <p className="text-amber-800 font-semibold text-sm">👉 By using loan services, you consent to data sharing</p>
                        </div>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.7 Pricing Disclaimer</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Prices are indicative only</li>
                            <li>Final price depends on dealer, taxes, and location</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.8 Intellectual Property</h3>
                        <p>All platform content belongs to Miraitu or its licensors. Unauthorized use is prohibited.</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.9 Limitation of Liability</h3>
                        <p>To the maximum extent permitted by law, Miraitu shall not be liable for:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Indirect or consequential damages</li>
                            <li>Loss of data or profits</li>
                            <li>Third-party actions</li>
                            <li>Platform downtime</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.10 Indemnity</h3>
                        <p>You agree to indemnify Miraitu against claims arising from:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Your misuse of platform</li>
                            <li>Violation of laws</li>
                            <li>Third-party disputes</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.11 Termination</h3>
                        <p>We may suspend or terminate access without prior notice.</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.12 Governing Law</h3>
                        <p>Governed by Indian law under the Arbitration and Conciliation Act 1996</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Arbitration location: Chennai</li>
                            <li>Decision: Final and binding</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">1.13 Contact</h3>
                        <p>Email: <a href="mailto:info@miraitu.in" className="text-[#2c5926] font-semibold hover:underline">info@miraitu.in</a></p>
                    </section>

                    {/* Section 2 - Privacy Policy */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">2. PRIVACY POLICY</h2>
                        <p>Miraitu Technologies Private Limited collects and processes personal data in compliance with:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Information Technology Act, 2000</li>
                            <li>SPDI Rules, 2011</li>
                            <li>Digital Personal Data Protection Act, 2023</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">Data We Collect:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Personal details (name, phone, email)</li>
                            <li>Device &amp; usage data</li>
                            <li>Financial/KYC data (if loan applied)</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">Usage:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Service delivery</li>
                            <li>Loan facilitation</li>
                            <li>Fraud prevention</li>
                            <li>Marketing</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">Sharing:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Lenders</li>
                            <li>Dealers</li>
                            <li>Service providers</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">Your Rights:</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Access, correction, deletion</li>
                            <li>Withdraw consent</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">Security:</h3>
                        <p>We use industry-standard safeguards, but no system is 100% secure.</p>
                    </section>

                    {/* Section 3 - Disclaimer */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">3. DISCLAIMER</h2>
                        <p>Miraitu.in:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provides information and lead generation only</li>
                            <li>Does not act as buyer, seller, or lender</li>
                        </ul>
                        <p className="mt-3">We do not guarantee:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Accuracy of listings</li>
                            <li>Product quality</li>
                            <li>Loan approvals</li>
                        </ul>
                        <p className="mt-3">All services are provided &quot;AS IS&quot;</p>
                    </section>

                    {/* Section 4 - DMCA / Copyright Policy */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">4. DMCA / COPYRIGHT POLICY</h2>
                        <p>Miraitu respects intellectual property rights.</p>
                        <p className="mt-3">To report infringement, send email to:</p>
                        <p className="mt-1"><a href="mailto:info@miraitu.in" className="text-[#2c5926] font-semibold hover:underline">info@miraitu.in</a></p>
                        <p className="mt-3">Include:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Proof of ownership</li>
                            <li>URL of infringing content</li>
                            <li>Contact details</li>
                        </ul>
                        <p className="mt-3">We will:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Review</li>
                            <li>Remove valid content</li>
                            <li>Take action against repeat offenders</li>
                        </ul>
                    </section>

                    {/* Section 5 - Loan & Lending Disclosure */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">5. LOAN &amp; LENDING DISCLOSURE</h2>
                        <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
                            <p className="text-amber-800 font-semibold text-sm">👉 Miraitu acts as a Lead generator / Lending Service Provider (LSP)</p>
                        </div>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>We connect users with RBI-regulated lenders</li>
                            <li>We do not control loan terms</li>
                        </ul>
                        <p className="mt-3">Users must:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Review lender terms carefully</li>
                            <li>Take independent financial decisions</li>
                        </ul>
                    </section>

                    {/* Section 6 - Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">6. DATA SECURITY</h2>
                        <p>We implement:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Encryption</li>
                            <li>Secure infrastructure</li>
                            <li>Access controls</li>
                        </ul>
                        <div className="bg-amber-50 rounded-xl p-4 mt-4 border border-amber-200">
                            <p className="text-amber-800 font-semibold text-sm">👉 Absolute security cannot be guaranteed</p>
                        </div>
                    </section>

                    {/* Section 7 - Grievance Redressal */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">7. GRIEVANCE REDRESSAL</h2>
                        <div className="bg-[#f0f7ef] rounded-xl p-6 mt-4 border border-[#2c5926]/10">
                            <p className="font-bold text-[#1a3617] text-lg">Grievance Officer</p>
                            <p className="text-gray-600 mt-1">Miraitu Technologies Private Limited</p>
                            <div className="mt-4 space-y-2">
                                <p>📧 Email: <a href="mailto:info@miraitu.in" className="text-[#2c5926] font-semibold hover:underline">info@miraitu.in</a></p>
                                <p>📍 Address: No 4A, Vinayaka Layout, Parappana Agrahara, Bengaluru, Karnataka – 560100</p>
                                <p>🕒 Resolution time: Within 30 days</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
