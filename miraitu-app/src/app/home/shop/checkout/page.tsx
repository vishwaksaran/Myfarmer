'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { useCart } from '@/context/CartContext';
import { featuredProducts } from '../data';

export default function CheckoutPage() {
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
    const [paymentMethod, setPaymentMethod] = useState('');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);

    const { quantities, deleteItem, clearCart } = useCart();

    // Compute cart items from quantities and product data
    const cartItems = Object.entries(quantities).map(([idStr, qty]) => {
        const id = parseInt(idStr);
        const product = featuredProducts.find(p => p.id === id);
        if (!product) return null;

        // Parse price to number (remove currency symbol and commas)
        const priceNum = parseInt(product.price.replace(/[^\d]/g, ''));

        return {
            ...product,
            qty,
            totalPrice: priceNum * qty
        };
    }).filter(item => item !== null) as (typeof featuredProducts[0] & { qty: number, totalPrice: number })[];

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = 200; // Flat discount for now
    const total = Math.max(0, subtotal - discount);

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
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
        if (!paymentMethod) e.payment = 'Select a payment method';
        if (paymentMethod === 'upi' && !upiId.trim()) e.upiId = 'Enter UPI ID';
        if (paymentMethod === 'card') {
            if (!cardNumber.trim()) e.cardNumber = 'Card number is required';
            if (!cardExpiry.trim()) e.cardExpiry = 'Expiry is required';
            if (!cardCvv.trim()) e.cardCvv = 'CVV is required';
            if (!cardName.trim()) e.cardName = 'Name on card is required';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePlaceOrder = () => {
        if (validate()) {
            setOrderPlaced(true);
            setTimeout(clearCart, 500); // Clear cart after order placement
        }
    };

    const InputField = ({ label, field, placeholder, type = 'text', required = true, maxLength }: { label: string; field: string; placeholder: string; type?: string; required?: boolean; maxLength?: number }) => (
        <div>
            <label className="text-xs font-bold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                className={`w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 font-medium text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all ${errors[field] ? 'border-red-400' : 'border-transparent focus:border-primary'}`}
                placeholder={placeholder}
                type={type}
                value={(form as any)[field]}
                maxLength={maxLength}
                onChange={(e) => updateField(field, type === 'tel' ? e.target.value.replace(/\D/g, '') : e.target.value)}
            />
            {errors[field] && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors[field]}</p>}
        </div>
    );

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
                <Header />
                <main className="py-20">
                    <div className="mx-auto max-w-lg px-6 text-center">
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30 animate-bounce">
                                <span className="material-symbols-outlined text-white text-5xl">check</span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Order Placed!</h1>
                            <p className="text-gray-500 mb-2">Your order has been placed successfully.</p>
                            <p className="text-sm text-gray-400 mb-8">Order ID: #MIR{Date.now().toString().slice(-8)}</p>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                                    <span className="material-symbols-outlined text-lg">local_shipping</span>
                                    Estimated delivery in 3-5 business days
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/home/shop" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-center hover:brightness-110 transition-all">
                                    Continue Shopping
                                </Link>
                                <Link href="/home" className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
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

            <main className="py-8">
                <div className="mx-auto max-w-[1100px] px-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/home/shop" className="hover:text-primary transition-colors">Shop</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-gray-900 dark:text-white font-bold">Checkout</span>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Checkout</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left - Address & Payment */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Delivery Address */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center shadow-md">
                                        <span className="material-symbols-outlined text-white text-xl">location_on</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Delivery Address</h2>
                                        <p className="text-xs text-gray-500">Where should we deliver your order?</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="Full Name" field="fullName" placeholder="Your full name" />
                                        <InputField label="Phone Number" field="phone" placeholder="10-digit number" type="tel" maxLength={10} />
                                    </div>
                                    <InputField label="Email" field="email" placeholder="email@example.com (optional)" type="email" required={false} />
                                    <InputField label="Full Address" field="address" placeholder="House no., street, area" />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <InputField label="City / District" field="city" placeholder="City" />
                                        <InputField label="State" field="state" placeholder="State" />
                                        <InputField label="Pincode" field="pincode" placeholder="6-digit pincode" type="tel" maxLength={6} />
                                    </div>
                                    <InputField label="Landmark" field="landmark" placeholder="Near temple, school etc. (optional)" required={false} />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center shadow-md">
                                        <span className="material-symbols-outlined text-white text-xl">payments</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 dark:text-white">Payment Method</h2>
                                        <p className="text-xs text-gray-500">Choose your preferred payment option</p>
                                    </div>
                                </div>
                                {errors.payment && <p className="text-xs text-red-500 font-bold mb-4 flex items-center gap-1"><span className="material-symbols-outlined text-xs">error</span>{errors.payment}</p>}

                                <div className="space-y-3">
                                    {/* UPI */}
                                    <div
                                        onClick={() => { setPaymentMethod('upi'); setErrors(prev => ({ ...prev, payment: '' })); }}
                                        className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-primary' : 'border-gray-300'}`}>
                                                {paymentMethod === 'upi' && <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>}
                                            </div>
                                            <span className="material-symbols-outlined text-purple-600 text-xl">account_balance</span>
                                            <div className="flex-1">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">UPI Payment</span>
                                                <p className="text-[11px] text-gray-500">Google Pay, PhonePe, Paytm, BHIM</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {['GPay', 'PhonePe', 'Paytm'].map(b => (
                                                    <span key={b} className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{b}</span>
                                                ))}
                                            </div>
                                        </div>
                                        {paymentMethod === 'upi' && (
                                            <div className="mt-4 ml-8">
                                                <label className="text-xs font-bold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider">UPI ID <span className="text-red-500">*</span></label>
                                                <input
                                                    className={`w-full max-w-xs rounded-xl bg-white dark:bg-gray-800 border-2 px-4 py-3 font-medium text-sm outline-none transition-all ${errors.upiId ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-primary'}`}
                                                    placeholder="yourname@upi"
                                                    value={upiId}
                                                    onChange={(e) => { setUpiId(e.target.value); setErrors(prev => ({ ...prev, upiId: '' })); }}
                                                />
                                                {errors.upiId && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.upiId}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card */}
                                    <div
                                        onClick={() => { setPaymentMethod('card'); setErrors(prev => ({ ...prev, payment: '' })); }}
                                        className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary' : 'border-gray-300'}`}>
                                                {paymentMethod === 'card' && <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>}
                                            </div>
                                            <span className="material-symbols-outlined text-blue-600 text-xl">credit_card</span>
                                            <div className="flex-1">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">Credit / Debit Card</span>
                                                <p className="text-[11px] text-gray-500">Visa, Mastercard, RuPay</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {['Visa', 'MC', 'RuPay'].map(b => (
                                                    <span key={b} className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{b}</span>
                                                ))}
                                            </div>
                                        </div>
                                        {paymentMethod === 'card' && (
                                            <div className="mt-4 ml-8 space-y-3">
                                                <div>
                                                    <label className="text-xs font-bold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider">Card Number <span className="text-red-500">*</span></label>
                                                    <input
                                                        className={`w-full rounded-xl bg-white dark:bg-gray-800 border-2 px-4 py-3 font-medium text-sm outline-none transition-all ${errors.cardNumber ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-primary'}`}
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength={19}
                                                        value={cardNumber}
                                                        onChange={(e) => { setCardNumber(e.target.value); setErrors(prev => ({ ...prev, cardNumber: '' })); }}
                                                    />
                                                    {errors.cardNumber && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.cardNumber}</p>}
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name on Card <span className="text-red-500">*</span></label>
                                                    <input
                                                        className={`w-full rounded-xl bg-white dark:bg-gray-800 border-2 px-4 py-3 font-medium text-sm outline-none transition-all ${errors.cardName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-primary'}`}
                                                        placeholder="Name as on card"
                                                        value={cardName}
                                                        onChange={(e) => { setCardName(e.target.value); setErrors(prev => ({ ...prev, cardName: '' })); }}
                                                    />
                                                    {errors.cardName && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.cardName}</p>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-bold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider">Expiry <span className="text-red-500">*</span></label>
                                                        <input
                                                            className={`w-full rounded-xl bg-white dark:bg-gray-800 border-2 px-4 py-3 font-medium text-sm outline-none transition-all ${errors.cardExpiry ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-primary'}`}
                                                            placeholder="MM/YY"
                                                            maxLength={5}
                                                            value={cardExpiry}
                                                            onChange={(e) => { setCardExpiry(e.target.value); setErrors(prev => ({ ...prev, cardExpiry: '' })); }}
                                                        />
                                                        {errors.cardExpiry && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.cardExpiry}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider">CVV <span className="text-red-500">*</span></label>
                                                        <input
                                                            className={`w-full rounded-xl bg-white dark:bg-gray-800 border-2 px-4 py-3 font-medium text-sm outline-none transition-all ${errors.cardCvv ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-primary'}`}
                                                            placeholder="•••"
                                                            maxLength={4}
                                                            type="password"
                                                            value={cardCvv}
                                                            onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, '')); setErrors(prev => ({ ...prev, cardCvv: '' })); }}
                                                        />
                                                        {errors.cardCvv && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.cardCvv}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* COD */}
                                    <div
                                        onClick={() => { setPaymentMethod('cod'); setErrors(prev => ({ ...prev, payment: '' })); }}
                                        className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                                                {paymentMethod === 'cod' && <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>}
                                            </div>
                                            <span className="material-symbols-outlined text-green-600 text-xl">payments</span>
                                            <div className="flex-1">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">Cash on Delivery</span>
                                                <p className="text-[11px] text-gray-500">Pay when you receive your order</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Net Banking */}
                                    <div
                                        onClick={() => { setPaymentMethod('netbanking'); setErrors(prev => ({ ...prev, payment: '' })); }}
                                        className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'netbanking' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'netbanking' ? 'border-primary' : 'border-gray-300'}`}>
                                                {paymentMethod === 'netbanking' && <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>}
                                            </div>
                                            <span className="material-symbols-outlined text-indigo-600 text-xl">account_balance</span>
                                            <div className="flex-1">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">Net Banking</span>
                                                <p className="text-[11px] text-gray-500">SBI, HDFC, ICICI, PNB and more</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">receipt_long</span>
                                    Order Summary
                                </h3>

                                {/* Cart Items */}
                                <div className="space-y-4 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                                    {cartItems.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">Your cart is empty.</p>
                                    ) : (
                                        cartItems.map((item) => (
                                            <div key={item.id} className="relative flex gap-3 group">
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight mb-1" title={item.name}>{item.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>Qty: {item.qty}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span>{item.price} each</span>
                                                    </div>
                                                    <div className="mt-1 font-bold text-primary text-sm">₹{item.totalPrice.toLocaleString('en-IN')}</div>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="absolute top-0 right-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    title="Remove item"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Delivery</span>
                                        <span className="font-bold text-green-600">FREE</span>
                                    </div>
                                    {subtotal > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Discount</span>
                                            <span className="font-bold text-red-500">-₹{discount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg font-black text-gray-900 dark:text-white">Total</span>
                                    <span className="text-2xl font-black text-primary">₹{total.toLocaleString('en-IN')}</span>
                                </div>

                                {/* Place Order */}
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={cartItems.length === 0}
                                    className={`w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-green-500 text-white font-black text-base tracking-wide flex items-center justify-center gap-2 group transition-all shadow-lg shadow-primary/25 ${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98]'}`}
                                >
                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">lock</span>
                                    Place Order
                                </button>

                                {/* Security */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
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
