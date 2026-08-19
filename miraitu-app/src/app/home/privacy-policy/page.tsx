'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a3617] to-[#2c5926] text-white py-12 px-6">
                <div className="mx-auto max-w-4xl">
                    <Link href="/home" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black">Privacy Policy – Miraitu.in</h1>
                    <p className="text-white/70 mt-2 text-sm">Last Updated: 28/03/2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="prose prose-green max-w-none text-gray-700 leading-relaxed space-y-8">

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">1. INTRODUCTION</h2>
                        <div className="space-y-4">
                            <p><strong>1.1</strong> This Privacy Policy (&quot;Policy&quot;) constitutes an electronic record in the form of a contract under the provisions of the Information Technology Act, 2000 and applicable rules made thereunder, as amended from time to time. This Policy does not require any physical, electronic, or digital signature.</p>
                            <p><strong>1.2</strong> This Privacy Policy applies to all products, services, content, features, technologies, or functions offered by Miraitu.in (&quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, &quot;Our&quot;), including all associated websites, mobile applications, platforms, and digital services (collectively referred to as &quot;Services&quot;).</p>
                            <p><strong>1.3</strong> This Policy governs your access to and use of Miraitu.in and all related platforms operated by the Company.</p>
                            <p><strong>1.4</strong> For the purpose of this Policy:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>&quot;You&quot;, &quot;Your&quot;, &quot;User&quot; refers to any individual accessing or using our Services</li>
                                <li>&quot;We&quot;, &quot;Us&quot;, &quot;Our&quot; refers to Miraitu.in</li>
                            </ul>
                            <p><strong>1.5</strong> We are committed to protecting your privacy and ensuring the security of your personal data. This Policy explains how we collect, use, process, store, share, and protect your personal information (&quot;Information&quot;) in compliance with:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Information Technology Act, 2000</li>
                                <li>SPDI Rules, 2011</li>
                                <li>Digital Personal Data Protection Act, 2023 (DPDPA), where applicable</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">2. INFORMATION WE COLLECT</h2>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">2.1 Information Provided by You</h3>
                        <p>We may collect the following information when you interact with our Services:</p>

                        <h4 className="font-semibold mt-4 mb-2">(a) Personal Details</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Name, email address, mobile number</li>
                            <li>Location and address details</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">(b) Account &amp; Login Information</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Username or social media login details (if applicable)</li>
                            <li>Passwords (stored securely)</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">(c) KYC &amp; Identity Verification</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>PAN, Aadhaar, Driving License, or other identity documents</li>
                            <li>Any other information required for verification</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">(d) Communication Records</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Emails, chats, customer support interactions</li>
                            <li>Call recordings (where permitted by law)</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">(e) Vehicle / Asset Information (if applicable)</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Registration number, ownership details</li>
                            <li>Insurance and compliance documents</li>
                            <li>Service and maintenance history</li>
                            <li>Vehicle specifications and usage data</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">2.2 Automatically Collected Information</h3>

                        <h4 className="font-semibold mt-4 mb-2">(a) Device &amp; Log Data</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>IP address, browser type, operating system</li>
                            <li>Login timestamps and activity logs</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">(b) Location Data</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>GPS location, IP-based location, network data</li>
                            <li>You may disable location access via device settings</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">(c) Usage &amp; Clickstream Data</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Pages visited, searches performed</li>
                            <li>Time spent on platform and interactions</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">(d) Cookies &amp; Tracking Technologies</h4>
                        <p>We use cookies, pixels, and similar technologies to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Improve user experience</li>
                            <li>Analyze trends</li>
                            <li>Personalize content</li>
                        </ul>
                        <p className="mt-2">You may disable cookies through your browser settings, but some features may not function properly.</p>

                        <h4 className="font-semibold mt-4 mb-2">(e) Advertising Cookies</h4>
                        <p>
                            We display advertisements supplied by Google AdSense on some parts of Miraitu, such as
                            marketplace and category pages. We do not show advertisements on login, registration,
                            listing creation, cart, checkout, dashboard or administrative screens.
                        </p>
                        <p className="mt-2">
                            Google and its partners use cookies and similar technologies to serve and measure these
                            advertisements. Where you have given consent, these may be used to show advertisements
                            based on your prior visits to Miraitu or other websites. Google&apos;s use of advertising
                            cookies is described in its own policies.
                        </p>
                        <p className="mt-2">
                            We ask for your consent before advertising cookies are used. If you decline, or have not
                            yet responded, you will still see advertisements, but they will be non-personalised —
                            based on general context rather than your activity. You may change or withdraw your choice
                            at any time from Settings, and withdrawal is as straightforward as giving consent.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>
                                Manage Google ad personalisation:{' '}
                                <a
                                    href="https://myadcenter.google.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#2c5926] underline"
                                >
                                    myadcenter.google.com
                                </a>
                            </li>
                            <li>
                                How Google uses data from sites that use its services:{' '}
                                <a
                                    href="https://policies.google.com/technologies/partner-sites"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#2c5926] underline"
                                >
                                    policies.google.com/technologies/partner-sites
                                </a>
                            </li>
                        </ul>
                        <p className="mt-2">
                            Advertising is not personalised for users we know to be children, and we do not use
                            sensitive personal data for advertising purposes.
                        </p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">2.3 Third-Party Sources</h3>
                        <p>We may receive information from:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Third-party service providers</li>
                            <li>Partners or dealers</li>
                            <li>Public or authorized databases</li>
                        </ul>
                        <p className="mt-2">We are not responsible for third-party privacy practices. Users are advised to review their policies.</p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">3. HOW WE USE YOUR INFORMATION</h2>
                        <p>We use your information for the following purposes:</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">3.1 Service Delivery</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide access to our platform</li>
                            <li>Enable account creation and login</li>
                            <li>Deliver requested services</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">3.2 Personalization &amp; Improvement</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide relevant content and recommendations</li>
                            <li>Improve platform performance and usability</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">3.3 Business Operations</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Conduct verification, compliance checks</li>
                            <li>Support vehicle-related services and listings</li>
                            <li>Enable partnerships and third-party integrations</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">3.4 Marketing &amp; Communication</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Send updates, offers, and promotional content</li>
                            <li>Conduct surveys and feedback collection</li>
                        </ul>
                        <p className="mt-2">You can opt out of marketing communications anytime.</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">3.5 Security &amp; Fraud Prevention</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Monitor suspicious activities</li>
                            <li>Prevent fraud and misuse</li>
                            <li>Protect platform integrity</li>
                        </ul>
                        <p className="mt-2">We may use automated tools to detect fraudulent behavior.</p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">4. SHARING OF INFORMATION</h2>
                        <p>We may share your information with:</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">4.1 Internal Entities</h3>
                        <p>Group companies or affiliates</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">4.2 Service Providers</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Cloud storage providers</li>
                            <li>Technical and operational vendors</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">4.3 Business Partners</h3>
                        <p>Dealers, lenders, or partners (if applicable)</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">4.4 Authorities</h3>
                        <p>Government or regulatory bodies as required by law</p>

                        <h3 className="text-lg font-semibold text-[#2c5926] mt-6 mb-3">4.5 Business Transfers</h3>
                        <p>In case of merger, acquisition, or restructuring</p>
                        <p className="mt-2">We ensure all third parties follow appropriate data protection standards.</p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">5. CONSENT</h2>
                        <p>By using our Services, you:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Consent to collection and processing of your information</li>
                            <li>Confirm that the information provided is accurate</li>
                            <li>Authorize us to use and share information as per this Policy</li>
                        </ul>
                        <p className="mt-2">You may withdraw consent at any time, subject to legal or contractual obligations.</p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">6. JOB APPLICANTS</h2>
                        <p>If you apply for a job with us, your information will be used solely for recruitment purposes and may be shared with recruitment partners.</p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">7. AGE RESTRICTION</h2>
                        <p>Our Services are not intended for individuals under 18 years of age. If we become aware of such data, we will delete it promptly.</p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">8. POLICY UPDATES</h2>
                        <p>We may update this Policy from time to time. Changes will be notified via:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Website updates</li>
                            <li>Email notifications (where applicable)</li>
                        </ul>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">9. DATA SECURITY</h2>
                        <p>We implement appropriate security measures such as:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Encryption</li>
                            <li>Access control</li>
                            <li>Secure servers</li>
                        </ul>
                        <p className="mt-2">However, no system is completely secure, and we cannot guarantee absolute protection.</p>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">10. YOUR RIGHTS</h2>
                        <p>You have the following rights:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Access your data</li>
                            <li>Correct inaccurate data</li>
                            <li>Withdraw consent</li>
                            <li>Request deletion</li>
                            <li>Restrict processing</li>
                        </ul>
                        <p className="mt-2">Requests can be made via contact details below.</p>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">11. DATA RETENTION</h2>
                        <p>We retain your information:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>As required by law</li>
                            <li>For business and operational needs</li>
                        </ul>
                        <p className="mt-2">Data will be deleted or anonymized when no longer required.</p>
                    </section>

                    {/* Section 12 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">12. DISCLAIMER</h2>
                        <p>We are not responsible for any data shared by you voluntarily beyond what is requested.</p>
                    </section>

                    {/* Section 13 */}
                    <section>
                        <h2 className="text-2xl font-bold text-[#1a3617] mb-4">13. GRIEVANCE REDRESSAL</h2>
                        <p>For any concerns or complaints, contact:</p>
                        <div className="bg-[#f0f7ef] rounded-xl p-6 mt-4 border border-[#2c5926]/10">
                            <p className="font-semibold text-[#1a3617]">Grievance Officer</p>
                            <p className="mt-2">Email: <a href="mailto:support@miraitu.in" className="text-[#2c5926] font-semibold hover:underline">support@miraitu.in</a></p>
                            <p className="mt-1">Address: No 4A, Vinayaka Layout, Parappana Agrahara, Bengaluru, Karnataka 560100</p>
                        </div>
                        <p className="mt-4">The grievance officer will endeavour to redress your grievances expeditiously within a period of one month from the receipt of your request.</p>
                        <p className="mt-2">Please note that the grievance officer may be changed by us from time to time by updating this Privacy Policy.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
