'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { featuredProducts } from '../data';
import { categoryProducts, type Product } from '../categoryData';

interface RazorpaySuccessPayload {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayFailurePayload {
    error?: {
        description?: string;
        reason?: string;
    };
}

interface RazorpayCheckoutInstance {
    open: () => void;
    on: (event: 'payment.failed', callback: (payload: RazorpayFailurePayload) => void) => void;
}

interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
    handler: (response: RazorpaySuccessPayload) => Promise<void>;
}

interface CheckoutInputFieldProps {
    label: string;
    field: string;
    placeholder: string;
    value: string;
    error?: string;
    type?: string;
    required?: boolean;
    maxLength?: number;
    onChange: (field: string, value: string, type: string) => void;
}

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
    }
}

function createCheckoutAttemptId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.floor(Math.random() * 16);
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function CheckoutInputField({
    label,
    field,
    placeholder,
    value,
    error,
    type = 'text',
    required = true,
    maxLength,
    onChange,
}: CheckoutInputFieldProps) {
    return (
        <div>
            <label className="text-[10px] md:text-xs font-bold block mb-1 md:mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                className={`w-full rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-3 md:px-4 py-2.5 md:py-3 font-medium text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all ${error ? 'border-red-400' : 'border-transparent focus:border-primary'}`}
                placeholder={placeholder}
                type={type}
                value={value}
                maxLength={maxLength}
                onChange={(e) => onChange(field, e.target.value, type)}
            />
            {error && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{error}</p>}
        </div>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const paymentMode = String(process.env.NEXT_PUBLIC_RAZORPAY_MODE || 'test').toLowerCase();
    const isTestMode = paymentMode !== 'live';
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [placingOrder, setPlacingOrder] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [testPaymentAttempted, setTestPaymentAttempted] = useState(false);
    const [testPaymentReference, setTestPaymentReference] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [orderStatus, setOrderStatus] = useState('confirmed');

    const { quantities, deleteItem, clearCart } = useCart();

    // Build a combined product lookup from featured + all category products
    const allProducts: { id: number; name: string; price: string; originalPrice: string; rating: number; reviews: number; image: string; badge: string | null; description?: string }[] = [
        ...featuredProducts.map(p => ({ ...p, description: '' })),
        ...Object.values(categoryProducts).flat(),
    ];

    // Compute cart items from quantities and product data
    const cartItems = Object.entries(quantities).map(([idStr, qty]) => {
        const id = parseInt(idStr);
        const product = allProducts.find(p => p.id === id);
        if (!product) return null;

        // Parse price to number (remove currency symbol and commas)
        const priceNum = parseInt(product.price.replace(/[^\d]/g, ''));

        return {
            ...product,
            qty,
            totalPrice: priceNum * qty
        };
    }).filter(item => item !== null) as ({ id: number; name: string; price: string; originalPrice: string; rating: number; reviews: number; image: string; badge: string | null; qty: number; totalPrice: number })[];

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal;

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/user-login?redirect=/home/shop/checkout');
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (window.Razorpay) {
            setIsRazorpayLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setIsRazorpayLoaded(true);
        script.onerror = () => setPaymentError('Unable to load payment gateway. Please refresh and try again.');
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const updateField = (field: string, value: string, type: string = 'text') => {
        const nextValue = type === 'tel' ? value.replace(/\D/g, '') : value;
        setForm(prev => ({ ...prev, [field]: nextValue }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.fullName.trim()) e.fullName = 'Name is required';
        if (!form.phone.trim()) e.phone = 'Phone is required';
        else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter valid 10-digit number';
        if (!form.address.trim()) e.address = 'Address is required';
        if (!form.city.trim()) e.city = 'City is required';
        if (!form.state.trim()) e.state = 'State is required';
        if (!form.pincode.trim()) e.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter valid 6-digit pincode';
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter valid email';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validate() || cartItems.length === 0 || placingOrder) {
            return;
        }

        if (!isRazorpayLoaded || !window.Razorpay) {
            setPaymentError('Payment gateway is still loading. Please try again in a moment.');
            return;
        }

        setPlacingOrder(true);
        setPaymentError('');

        try {
            const checkoutAttemptId = createCheckoutAttemptId();

            const createOrderRes = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkoutAttemptId,
                    shippingAddress: form,
                    items: cartItems.map((item) => ({
                        productId: item.id,
                        quantity: item.qty,
                    })),
                }),
            });

            const createOrderPayload = await createOrderRes.json();

            if (!createOrderRes.ok) {
                throw new Error(createOrderPayload.error || 'Unable to start payment.');
            }

            const options: RazorpayCheckoutOptions = {
                key: String(createOrderPayload.razorpayKeyId),
                amount: Number(createOrderPayload.amount),
                currency: String(createOrderPayload.currency || 'INR'),
                name: 'Miraitu',
                description: isTestMode ? 'Test Payment Attempt' : `Order ${createOrderPayload.orderNumber}`,
                order_id: String(createOrderPayload.razorpayOrderId),
                prefill: {
                    name: form.fullName,
                    contact: form.phone,
                    email: form.email,
                },
                notes: {
                    mode: isTestMode ? 'test' : 'live',
                    app_order_id: createOrderPayload.appOrderId ? String(createOrderPayload.appOrderId) : '',
                    order_number: String(createOrderPayload.orderNumber),
                },
                theme: {
                    color: '#22c55e',
                },
                modal: {
                    ondismiss: () => setPlacingOrder(false),
                },
                handler: async (response) => {
                    if (isTestMode) {
                        setTestPaymentReference(String(response.razorpay_payment_id || createOrderPayload.razorpayOrderId || 'TEST_ATTEMPT'));
                        setTestPaymentAttempted(true);
                        setTimeout(clearCart, 300);
                        setPlacingOrder(false);
                        return;
                    }

                    try {
                        const verifyRes = await fetch('/api/razorpay/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                appOrderId: String(createOrderPayload.appOrderId),
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            }),
                        });

                        const verifyPayload = await verifyRes.json();

                        if (!verifyRes.ok) {
                            throw new Error(verifyPayload.error || 'Payment verification failed.');
                        }

                        setOrderNumber(String(verifyPayload.orderNumber || createOrderPayload.orderNumber));
                        setOrderStatus('confirmed');
                        setOrderPlaced(true);
                        setTimeout(clearCart, 300);
                    } catch (verifyError: unknown) {
                        const message = verifyError instanceof Error ? verifyError.message : 'Payment verification failed.';
                        setPaymentError(message);
                    } finally {
                        setPlacingOrder(false);
                    }
                },
            };

            const razorpayInstance = new window.Razorpay(options);

            razorpayInstance.on('payment.failed', (payload) => {
                const message = payload.error?.description || payload.error?.reason || 'Payment failed. Please try again.';
                setPaymentError(message);
                setPlacingOrder(false);
            });

            razorpayInstance.open();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unable to process payment.';
            setPaymentError(message);
            setPlacingOrder(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d] flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            </div>
        );
    }

    if (testPaymentAttempted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
                <Header />
                <main className="py-10 md:py-20">
                    <div className="mx-auto max-w-lg px-4 md:px-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-[2rem] p-6 md:p-10 shadow-xl border border-amber-200 dark:border-amber-700">
                            <div className="text-center mb-6">
                                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl shadow-amber-300/30">
                                    <span className="material-symbols-outlined text-white text-4xl md:text-5xl">science</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">Thanks For Testing Payment</h1>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-1">
                                    Your payment attempt was captured in Test Mode.
                                </p>
                                <p className="text-xs md:text-sm text-amber-700 font-semibold mb-2">
                                    No real amount is debited/credited in test mode.
                                </p>
                                <p className="text-xs md:text-sm text-gray-400">Reference: {testPaymentReference}</p>
                            </div>

                            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 mb-6 leading-relaxed">
                                This test attempt is intentionally not stored as a real order. It will not appear in My Orders or admin order workflow.
                            </div>

                            <div className="flex gap-3">
                                <Link href="/home/shop" className="flex-1 py-2.5 md:py-3 rounded-xl bg-primary text-white font-bold text-sm md:text-base text-center hover:brightness-110 transition-all">
                                    Back To Shop
                                </Link>
                                <Link href="/home/shop/checkout" className="flex-1 py-2.5 md:py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm md:text-base text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                                    Try Again
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (orderPlaced) {
        const trackingSteps = [
            { key: 'confirmed', label: 'Order Confirmed', icon: 'check_circle', time: 'Just now' },
            { key: 'processing', label: 'Processing', icon: 'inventory_2', time: 'Expected today' },
            { key: 'shipped', label: 'Shipped', icon: 'local_shipping', time: 'In 1-2 days' },
            { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'delivery_dining', time: 'In 2-4 days' },
            { key: 'delivered', label: 'Delivered', icon: 'home', time: 'In 3-5 days' },
        ];
        const activeIdx = trackingSteps.findIndex(s => s.key === orderStatus);

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
                <Header />
                <main className="py-10 md:py-20">
                    <div className="mx-auto max-w-lg px-4 md:px-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-[2rem] p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800">
                            <div className="text-center mb-6">
                                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl shadow-primary/30">
                                    <span className="material-symbols-outlined text-white text-4xl md:text-5xl">check</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">Order Placed!</h1>
                                <p className="text-sm md:text-base text-gray-500 mb-1">Your order has been placed successfully.</p>
                                <p className="text-xs md:text-sm text-gray-400 mb-4">Order ID: #{orderNumber}</p>
                            </div>

                            {/* Order Tracking */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">local_shipping</span>
                                    Order Tracking
                                </h3>
                                <div className="relative pl-8">
                                    {trackingSteps.map((step, idx) => (
                                        <div key={step.key} className="relative pb-6 last:pb-0">
                                            {idx < trackingSteps.length - 1 && (
                                                <div className={`absolute left-[-20px] top-6 w-0.5 h-full ${idx < activeIdx ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                            )}
                                            <div className={`absolute left-[-28px] top-0 w-5 h-5 rounded-full flex items-center justify-center ${idx <= activeIdx ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                                {idx <= activeIdx ? (
                                                    <span className="material-symbols-outlined text-white text-xs">check</span>
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={`text-sm font-bold ${idx <= activeIdx ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.label}</p>
                                                    <p className="text-xs text-gray-400">{step.time}</p>
                                                </div>
                                                <span className={`material-symbols-outlined text-lg ${idx <= activeIdx ? 'text-primary' : 'text-gray-300'}`}>{step.icon}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 md:p-4 mb-5 md:mb-6">
                                <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs md:text-sm">
                                    <span className="material-symbols-outlined text-base md:text-lg">local_shipping</span>
                                    Estimated delivery in 3-5 business days
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/home/shop/orders" className="flex-1 py-2.5 md:py-3 rounded-xl bg-primary text-white font-bold text-sm md:text-base text-center hover:brightness-110 transition-all">
                                    View My Orders
                                </Link>
                                <Link href="/home" className="flex-1 py-2.5 md:py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm md:text-base text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                                    Go Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />

            <main className="py-4 md:py-8">
                <div className="mx-auto max-w-[1100px] px-3 md:px-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                        <Link href="/home/shop" className="hover:text-primary transition-colors">Shop</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-gray-900 dark:text-white font-bold">Checkout</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-5 md:mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                        {/* Left - Address & Payment */}
                        <div className="lg:col-span-2 space-y-4 md:space-y-6">

                            {/* Delivery Address */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
                                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="material-symbols-outlined text-white text-lg md:text-xl">location_on</span>
                                    </div>
                                    <div>
                                        <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-white">Delivery Address</h2>
                                        <p className="text-[10px] md:text-xs text-gray-500">Where should we deliver your order?</p>
                                    </div>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <CheckoutInputField label="Full Name" field="fullName" placeholder="Your full name" value={form.fullName} error={errors.fullName} onChange={updateField} />
                                        <CheckoutInputField label="Phone Number" field="phone" placeholder="10-digit number" value={form.phone} error={errors.phone} type="tel" maxLength={10} onChange={updateField} />
                                    </div>
                                    <CheckoutInputField label="Email" field="email" placeholder="email@example.com (optional)" value={form.email} error={errors.email} type="email" required={false} onChange={updateField} />
                                    <CheckoutInputField label="Full Address" field="address" placeholder="House no., street, area" value={form.address} error={errors.address} onChange={updateField} />
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                        <CheckoutInputField label="City / District" field="city" placeholder="City" value={form.city} error={errors.city} onChange={updateField} />
                                        <CheckoutInputField label="State" field="state" placeholder="State" value={form.state} error={errors.state} onChange={updateField} />
                                        <div className="col-span-2 sm:col-span-1">
                                            <CheckoutInputField label="Pincode" field="pincode" placeholder="6-digit pincode" value={form.pincode} error={errors.pincode} type="tel" maxLength={6} onChange={updateField} />
                                        </div>
                                    </div>
                                    <CheckoutInputField label="Landmark" field="landmark" placeholder="Near temple, school etc. (optional)" value={form.landmark} error={errors.landmark} required={false} onChange={updateField} />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
                                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="material-symbols-outlined text-white text-lg md:text-xl">payments</span>
                                    </div>
                                    <div>
                                        <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-white">Secure Online Payment</h2>
                                        <p className="text-[10px] md:text-xs text-gray-500">Prepaid checkout powered by Razorpay</p>
                                    </div>
                                </div>
                                <div className="rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 md:p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl">shield_lock</span>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Only prepaid payments are enabled</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                You will pay securely on Razorpay using UPI, cards, wallet, or net banking.
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                We do not store raw card or UPI credentials on this page.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {paymentError && (
                                    <p className="text-xs text-red-500 font-bold mt-4 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">error</span>
                                        {paymentError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-24 bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg md:text-xl">receipt_long</span>
                                    Order Summary
                                </h3>

                                {/* Cart Items */}
                                <div className="space-y-3 md:space-y-4 mb-4 md:mb-5 pb-4 md:pb-5 border-b border-gray-100 dark:border-gray-800">
                                    {cartItems.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">Your cart is empty.</p>
                                    ) : (
                                        cartItems.map((item) => (
                                            <div key={item.id} className="relative flex gap-2.5 md:gap-3 group">
                                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate leading-tight mb-0.5 md:mb-1" title={item.name}>{item.name}</p>
                                                    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-500">
                                                        <span>Qty: {item.qty}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span>{item.price} each</span>
                                                    </div>
                                                    <div className="mt-0.5 md:mt-1 font-bold text-primary text-xs md:text-sm">₹{item.totalPrice.toLocaleString('en-IN')}</div>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="absolute top-0 right-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                                    title="Remove item"
                                                >
                                                    <span className="material-symbols-outlined text-base md:text-lg">delete</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 mb-4 md:mb-5 pb-4 md:pb-5 border-b border-gray-100 dark:border-gray-800 text-xs md:text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Delivery</span>
                                        <span className="font-bold text-green-600">FREE</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center mb-4 md:mb-6">
                                    <span className="text-base md:text-lg font-black text-gray-900 dark:text-white">Total</span>
                                    <span className="text-xl md:text-2xl font-black text-primary">₹{total.toLocaleString('en-IN')}</span>
                                </div>

                                {isTestMode && (
                                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                                        <p className="text-xs font-black uppercase tracking-wide text-amber-800 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">priority_high</span>
                                            Important Note - Test Mode
                                        </p>
                                        <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                                            Razorpay is currently running in Test Mode. Even if payment shows successful,
                                            no real money is debited from customer account and no amount is credited to your bank.
                                        </p>
                                    </div>
                                )}

                                {/* Place Order */}
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={cartItems.length === 0 || placingOrder || !isRazorpayLoaded}
                                    className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-primary to-green-500 text-white font-black text-sm md:text-base tracking-wide flex items-center justify-center gap-2 group transition-all shadow-lg shadow-primary/25 ${cartItems.length === 0 || placingOrder || !isRazorpayLoaded ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98]'}`}
                                >
                                    <span className={`material-symbols-outlined text-base md:text-lg ${placingOrder ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`}>
                                        {placingOrder ? 'progress_activity' : 'lock'}
                                    </span>
                                    {placingOrder ? 'Processing Payment...' : (isRazorpayLoaded ? 'Pay Securely with Razorpay' : 'Loading Payment Gateway...')}
                                </button>

                                {/* Security */}
                                <div className="mt-3 md:mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-xs text-primary">shield</span>
                                    Secure & Encrypted Payment
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

