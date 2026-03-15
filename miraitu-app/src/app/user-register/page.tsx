'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/supabase-db';

/**
 * UserRegisterPage - Multi-step registration form with Supabase OTP
 */
export default function UserRegisterPage() {
    const router = useRouter();
    const { user, signInWithPhone, verifyOtp, loginAsGuest } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        farmLocation: '',
        role: 'Farmer',
        crops: ['Rice'],
        password: '',
        confirmPassword: '',
        referralCode: '',
        termsAccepted: false,
    });

    // Handle Input Changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    // Handle Role Selection
    const handleRoleSelect = (role: string) => {
        setFormData(prev => ({ ...prev, role }));
    };

    // Handle Crop Selection
    const toggleCrop = (crop: string) => {
        setFormData(prev => {
            const currentCrops = [...prev.crops];
            if (currentCrops.includes(crop)) {
                return { ...prev, crops: currentCrops.filter(c => c !== crop) };
            } else {
                return { ...prev, crops: [...currentCrops, crop] };
            }
        });
    };

    // Send OTP to phone
    const handleSendOtp = async () => {
        const phone = formData.mobileNumber.trim();
        if (!phone || phone.length < 10) {
            setOtpError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setOtpError(null);
        setOtpLoading(true);
        try {
            const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
            const result = await signInWithPhone(formatted);
            if (result.error) {
                setOtpError(result.error);
            } else {
                setOtpSent(true);
            }
        } catch {
            setOtpError('Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (otpCode.length < 4) {
            setOtpError('Please enter the OTP code.');
            return;
        }
        setOtpError(null);
        setOtpLoading(true);
        try {
            const phone = formData.mobileNumber.trim();
            const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
            const result = await verifyOtp(formatted, otpCode);
            if (result.error) {
                setOtpError(result.error);
            } else {
                setPhoneVerified(true);
                setOtpError(null);
            }
        } catch {
            setOtpError('Failed to verify OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Navigation Handlers
    const nextStep = () => {
        setValidationError(null);
        // Validate Step 1
        if (currentStep === 1) {
            if (!formData.fullName.trim()) {
                setValidationError('Please enter your full name.');
                return;
            }
            if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
                setValidationError('Please enter a valid mobile number (10+ digits).');
                return;
            }
            if (!phoneVerified) {
                setValidationError('Please verify your mobile number with OTP before continuing.');
                return;
            }
        }
        // Validate Step 2
        if (currentStep === 2) {
            if (!formData.role) {
                setValidationError('Please select your role.');
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setValidationError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);
        if (!formData.password || formData.password.length < 6) {
            setValidationError('Password must be at least 6 characters.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match.');
            return;
        }
        if (!formData.termsAccepted) {
            setValidationError('Please accept the Terms and Privacy Policy.');
            return;
        }
        setLoading(true);
        try {
            // If user is authenticated via OTP, save profile to Supabase
            if (user && !user.isGuest) {
                await updateProfile(user.id, {
                    full_name: formData.fullName,
                    phone: formData.mobileNumber.startsWith('+') ? formData.mobileNumber : `+91${formData.mobileNumber}`,
                    role: formData.role.toLowerCase(),
                    farm_location: formData.farmLocation,
                });
            } else {
                // Fallback: log in as guest
                await loginAsGuest();
            }
            console.log('Registration data:', formData);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Registration error:', error);
            setValidationError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-redirect after showing success modal
    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                router.push('/');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessModal, router]);

    return (
        <div className="min-h-screen bg-[var(--miraitu-background-light)] dark:bg-background-dark font-display text-[#0f1a11] flex flex-col" data-no-auth>
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--miraitu-primary-green)]/10 bg-white/80 backdrop-blur-md px-6 md:px-10 py-4 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-3 text-[var(--miraitu-primary-green)]">
                    <div className='w-10 h-10'>
                        <MiraituLogo className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-[#0f1a11] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">Miraitu</h2>
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center py-12 px-4">
                {/* Heading */}
                <div className="max-w-[800px] w-full text-center mb-10 animate-fade-in">
                    <h1 className="text-[#0f1a11] dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] mb-3">
                        {currentStep === 1 && <>Cultivate Your <span className="text-[var(--miraitu-primary-green)]">Digital Garden</span></>}
                        {currentStep === 2 && <>Define Your <span className="text-[var(--miraitu-primary-green)]">Role</span></>}
                        {currentStep === 3 && <>Secure Your <span className="text-[var(--miraitu-primary-green)]">Account</span></>}
                    </h1>
                    <p className="text-[#53935d] dark:text-gray-400 text-lg font-medium">
                        {currentStep === 1 && "Join the digital ecosystem designed for modern farmers."}
                        {currentStep === 2 && "Help us personalize your experience by selecting your primary function."}
                        {currentStep === 3 && "Create a secure password to protect your farm data."}
                    </p>
                </div>

                {/* Card */}
                <div className="max-w-[860px] w-full skeuo-card rounded-2xl overflow-hidden p-6 md:p-10 relative animate-panel-entrance">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--miraitu-lush-leaf)]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--miraitu-harvest-gold)]/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    {/* Progress Header */}
                    <div className="flex flex-col gap-4 mb-12 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-[var(--miraitu-primary-green)] text-white text-[10px] font-bold rounded-full">
                                    {currentStep}
                                </span>
                                <p className="text-[#0f1a11] text-base font-bold">
                                    {currentStep === 1 && "Identity & Region"}
                                    {currentStep === 2 && "Role & Interests"}
                                    {currentStep === 3 && "Security & Confirmation"}
                                </p>
                            </div>
                            <p className="text-[#53935d] text-sm font-bold uppercase tracking-wider">Step {currentStep} of 3</p>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex p-0.5 border border-gray-200">
                            <div
                                className="h-full bg-[var(--miraitu-primary-green)] rounded-full shadow-[0_0_12px_rgba(34,195,61,0.5)] transition-all duration-500 ease-in-out"
                                style={{ width: `${(currentStep / 3) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Validation Error */}
                    {validationError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2 relative z-10 animate-fade-in">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {validationError}
                        </div>
                    )}

                    {/* STEP 1 CONTENTS */}
                    {currentStep === 1 && (
                        <div className="flex flex-col gap-8 animate-fade-in relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-[#0f1a11] text-sm font-bold uppercase tracking-wide ml-1">Full Name</span>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                                            <input
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none"
                                                placeholder="John Doe"
                                                type="text"
                                                required
                                            />
                                        </div>
                                    </label>
                                </div>
                                <div className="col-span-1">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-[#0f1a11] text-sm font-bold uppercase tracking-wide ml-1">
                                            Mobile Number
                                            {phoneVerified && (
                                                <span className="ml-2 text-[var(--miraitu-primary-green)] text-xs normal-case font-bold inline-flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                    Verified
                                                </span>
                                            )}
                                        </span>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">call</span>
                                            <input
                                                name="mobileNumber"
                                                value={formData.mobileNumber}
                                                onChange={(e) => {
                                                    handleInputChange(e);
                                                    // Reset verification if number changes
                                                    if (phoneVerified) {
                                                        setPhoneVerified(false);
                                                        setOtpSent(false);
                                                        setOtpCode('');
                                                    }
                                                }}
                                                disabled={phoneVerified}
                                                className={`skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border bg-[#fcfdfc] outline-none ${phoneVerified ? 'border-[var(--miraitu-primary-green)] bg-green-50/50 text-gray-600' : 'border-gray-200 focus:border-[var(--miraitu-primary-green)]'}`}
                                                placeholder="+91 XXXXX XXXXX"
                                                type="tel"
                                                required
                                                minLength={10}
                                            />
                                        </div>
                                    </label>

                                    {/* OTP Verification Section */}
                                    {!phoneVerified && (
                                        <div className="mt-3 space-y-3">
                                            {/* OTP Error */}
                                            {otpError && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">error</span>
                                                    {otpError}
                                                </div>
                                            )}

                                            {!otpSent ? (
                                                /* Send OTP Button */
                                                <button
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    disabled={otpLoading || !formData.mobileNumber || formData.mobileNumber.length < 10}
                                                    className="w-full py-3 rounded-xl bg-[var(--miraitu-primary-green)] text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--miraitu-primary-green)]/20"
                                                >
                                                    {otpLoading ? (
                                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-lg">sms</span>
                                                            Verify
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                /* OTP Input + Verify */
                                                <div className="space-y-2">
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        OTP sent to <span className="font-bold text-[var(--miraitu-primary-green)]">+91{formData.mobileNumber.replace(/^\+91/, '')}</span>
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                                                            <input
                                                                value={otpCode}
                                                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                className="skeuo-input w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none text-center tracking-[0.3em] font-bold text-lg"
                                                                placeholder="• • • • • •"
                                                                type="text"
                                                                maxLength={6}
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={handleVerifyOtp}
                                                            disabled={otpLoading || otpCode.length < 4}
                                                            className="px-5 py-3 rounded-xl bg-[var(--miraitu-primary-green)] text-white font-bold text-sm flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                                        >
                                                            {otpLoading ? (
                                                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                            ) : (
                                                                <>
                                                                    <span className="material-symbols-outlined text-lg">check</span>
                                                                    Verify
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOtp}
                                                        disabled={otpLoading}
                                                        className="text-xs font-bold text-[var(--miraitu-primary-green)] hover:underline"
                                                    >
                                                        Resend OTP
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button onClick={nextStep} className="skeuo-button-next px-8 py-4 w-full md:w-auto text-sm uppercase tracking-widest">
                                    Continue to Role
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 CONTENTS */}
                    {currentStep === 2 && (
                        <div className="space-y-12 animate-fade-in relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {['Farmer', 'Owner', 'Provider', 'Dealer'].map((r) => (
                                    <div
                                        key={r}
                                        onClick={() => handleRoleSelect(r)}
                                        className={`skeuo-role-card group ${formData.role === r ? 'selected' : ''}`}
                                    >
                                        <div className="icon-3d">
                                            <span className="material-symbols-outlined text-4xl" style={formData.role === r ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                                {r === 'Farmer' && 'potted_plant'}
                                                {r === 'Owner' && 'tram'}
                                                {r === 'Provider' && 'hail'}
                                                {r === 'Dealer' && 'store'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-[#0f1a11]">{r}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                            {r === 'Farmer' && 'Cultivator'}
                                            {r === 'Owner' && 'Machinery'}
                                            {r === 'Provider' && 'Expert Services'}
                                            {r === 'Dealer' && 'Market Supplies'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[var(--miraitu-harvest-gold)]">stars</span>
                                    <h4 className="text-sm font-black uppercase tracking-[0.15em] text-[#0f1a11]">Primary Crop / Focus</h4>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {['Rice', 'Wheat', 'Corn', 'Livestock', 'Soybeans', 'Fruit & Nuts', 'Vegetables', 'Sugarcane'].map(crop => (
                                        <div
                                            key={crop}
                                            onClick={() => toggleCrop(crop)}
                                            className={`skeuo-pill ${formData.crops.includes(crop) ? 'selected' : ''}`}
                                        >
                                            {crop}
                                        </div>
                                    ))}
                                    <div className="skeuo-pill flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">add</span> Other
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 pt-4">
                                <button onClick={prevStep} className="skeuo-button-back flex-1 uppercase tracking-widest text-xs h-14">
                                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                                    Back
                                </button>
                                <button onClick={nextStep} className="skeuo-button-next flex-[2] uppercase tracking-widest text-sm h-14">
                                    Continue to Final Step
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 CONTENTS */}
                    {currentStep === 3 && (
                        <div className="flex flex-col gap-8 animate-fade-in relative z-10">
                            <div className="max-w-md mx-auto w-full flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#0f1a11] text-sm font-bold uppercase tracking-wide ml-1">Password</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                                        <input
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none"
                                            placeholder="••••••••"
                                            type="password"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#0f1a11] text-sm font-bold uppercase tracking-wide ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock_reset</span>
                                        <input
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none"
                                            placeholder="••••••••"
                                            type="password"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#0f1a11] text-sm font-bold uppercase tracking-wide ml-1">Referral Code (Optional)</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">confirmation_number</span>
                                        <input
                                            name="referralCode"
                                            value={formData.referralCode}
                                            onChange={handleInputChange}
                                            className="skeuo-input w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#fcfdfc] focus:border-[var(--miraitu-primary-green)] outline-none"
                                            placeholder="REF-12345"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-[var(--miraitu-lime-green)]/10 border border-[var(--miraitu-lime-green)]/30">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted}
                                        onChange={handleInputChange}
                                        className="leaf-checkbox mt-1"
                                    />
                                    <label className="text-[#0f1a11] text-xs font-medium leading-relaxed cursor-pointer select-none" htmlFor="terms">
                                        I agree to the <a className="text-[var(--miraitu-primary-green)] font-bold underline" href="#">Terms</a> and <a className="text-[var(--miraitu-primary-green)] font-bold underline" href="#">Privacy Policy</a>.
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-6">
                                <button onClick={prevStep} className="skeuo-button-back flex-1 uppercase tracking-widest text-xs h-14">
                                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.termsAccepted || loading}
                                    className="skeuo-button-next flex-[2] uppercase tracking-widest text-sm h-14 disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                                >
                                    {loading ? (
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    ) : (
                                        <>
                                            Complete Registration
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Elements */}
                <div className="mt-16 flex flex-wrap justify-center gap-12 grayscale opacity-40 animate-footer-entrance">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">shield</span>
                        <span className="text-xs font-bold uppercase tracking-[0.1em]">Privacy Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">psychology</span>
                        <span className="text-xs font-bold uppercase tracking-[0.1em]">Smart Matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-xs font-bold uppercase tracking-[0.1em]">50k+ Members</span>
                    </div>
                </div>
            </main>
            <footer className="py-10 border-t border-[var(--miraitu-primary-green)]/10 bg-white/50 text-center">
                <p className="text-sm text-[#53935d]">© 2026 Miraitu Agriculture Tech. Empowering farmers globally.</p>
            </footer>

            {/* Success Registration Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 text-center animate-in zoom-in-95 fade-in duration-300">
                        {/* Decorative background */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[var(--miraitu-lime-green)]/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[var(--miraitu-harvest-gold)]/10 rounded-full blur-2xl" />
                        </div>

                        <div className="relative z-10">
                            {/* Animated Checkmark */}
                            <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-[var(--miraitu-primary-green)] to-[var(--miraitu-lime-green)] flex items-center justify-center shadow-lg shadow-[var(--miraitu-primary-green)]/30 animate-bounce-once">
                                <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl md:text-3xl font-black text-[#0f1a11] mb-2 tracking-tight">
                                Successfully Registered!
                            </h2>
                            <p className="text-[#53935d] text-base font-medium mb-2">
                                Welcome to Miraitu, <span className="font-bold text-[var(--miraitu-primary-green)]">{formData.fullName || 'Farmer'}</span>!
                            </p>
                            <p className="text-gray-500 text-sm mb-8">
                                Your account has been created successfully. You can now explore our full range of agricultural services.
                            </p>

                            {/* User Card Preview */}
                            <div className="bg-[var(--miraitu-primary-green)]/5 rounded-2xl p-4 mb-8 flex items-center gap-3 border border-[var(--miraitu-primary-green)]/10">
                                <div className="size-12 rounded-full bg-gradient-to-br from-[var(--miraitu-primary-green)] to-[var(--miraitu-lime-green)] flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-2xl">person</span>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-bold text-[#0f1a11] truncate">{formData.fullName || 'Farmer'}</p>
                                    <p className="text-xs text-gray-500 truncate">{formData.role} • {formData.mobileNumber}</p>
                                </div>
                                <span className="material-symbols-outlined text-[var(--miraitu-primary-green)]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => router.push('/')}
                                className="w-full py-4 bg-gradient-to-r from-[var(--miraitu-primary-green)] to-[var(--miraitu-lime-green)] text-white font-bold text-base rounded-xl shadow-lg shadow-[var(--miraitu-primary-green)]/30 hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Start Exploring
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>

                            {/* Auto redirect notice */}
                            <p className="text-xs text-gray-400 mt-4 font-medium">Redirecting automatically in a few seconds...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
