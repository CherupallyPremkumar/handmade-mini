'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import CartSummary from '@/components/CartSummary';
import { formatINR } from '@/lib/format';
import { api } from '@/lib/api';
import { buildRazorpayOptions, openRazorpayModal } from '@/lib/razorpay';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

interface ShippingForm {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const grandTotal = useCartStore((s) => s.grandTotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const { isLoggedIn, user, getAuthHeaders } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState('');
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState<ShippingForm>({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Telangana',
    pincode: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace('/login?redirect=/checkout');
    }
  }, [mounted, isLoggedIn, router]);

  // Pre-fill name and email from logged-in user
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  if (!mounted || !isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-cream-deep rounded w-48 mb-8" />
          <div className="h-96 bg-cream-deep rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-bark mb-2">
          Your cart is empty
        </h1>
        <p className="font-body text-bark-light mb-6">
          Add some sarees before checking out
        </p>
        <Link href="/sarees" className="btn-primary">
          Browse Collection
        </Link>
      </div>
    );
  }

  function updateField(field: keyof ShippingForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) {
      errs.phone = 'Phone is required';
    } else if (!/^(\+91)?[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = 'Enter a valid Indian phone number';
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email';
    }
    if (!form.addressLine1.trim())
      errs.addressLine1 = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state) errs.state = 'State is required';
    if (!form.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(form.pincode)) {
      errs.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePayment() {
    if (!validate()) return;

    setPaymentError('');
    setLoading(true);
    try {
      // 1. Create order on backend
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API}/api/checkout/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone.startsWith('+91') ? form.phone : `+91${form.phone}`,
          customerEmail: form.email,
          shippingAddress: {
            line1: form.addressLine1,
            line2: form.addressLine2 || '',
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          items: items.map(item => ({
            productId: item.saree.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Failed to create order');
      }

      const order = await res.json();

      // 2. Redirect to Razorpay hosted checkout page — cart clears on confirmation page
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY || '';
      const callback = `${API}/api/checkout/payment-callback`;
      const phone = form.phone.startsWith('+91') ? form.phone : `+91${form.phone}`;

      // Build Razorpay redirect form and submit
      const formEl = document.createElement('form');
      formEl.method = 'POST';
      formEl.action = 'https://api.razorpay.com/v1/checkout/embedded';

      const fields: Record<string, string> = {
        key_id: key,
        order_id: order.razorpayOrderId,
        name: 'Dhanunjaiah Handlooms',
        description: 'Authentic Handwoven Sarees',
        'prefill[name]': form.name,
        'prefill[email]': form.email,
        'prefill[contact]': phone,
        callback_url: callback,
        cancel_url: window.location.href,
      };

      for (const [k, v] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        formEl.appendChild(input);
      }

      document.body.appendChild(formEl);
      formEl.submit();
      // Don't setLoading(false) — page is redirecting to Razorpay
    } catch (err) {
      setLoading(false);
      setPaymentError(
        err instanceof Error ? err.message : 'Payment failed. Please try again.'
      );
    }
  }

  return (
    <>
    {/* Full-page redirect overlay */}
    {loading && (
      <div className="fixed inset-0 z-50 bg-bark/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gold mx-auto animate-spin mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-display text-xl font-semibold text-cream">Redirecting to Payment...</p>
          <p className="font-ui text-sm text-cream/60 mt-2">Please wait, do not close this page</p>
        </div>
      </div>
    )}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-ui text-xs text-bark-light">
        <Link href="/cart" className="hover:text-maroon transition-colors">
          Cart
        </Link>
        <span>/</span>
        <span className="text-bark">Checkout</span>
      </nav>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-bark mb-8">
        Checkout
      </h1>

      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">
        {/* Shipping form */}
        <div className="mb-8 lg:mb-0">
          <div className="bg-white border border-cream-deep/60 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-bark mb-6">
              Shipping Address
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Lakshmi Devi"
                  className={`input-field ${errors.name ? '!border-red-400' : ''}`}
                />
                {errors.name && (
                  <p className="mt-1 font-ui text-xs text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-ui text-sm text-bark-light/60">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="98765 43210"
                      className={`input-field !pl-11 ${errors.phone ? '!border-red-400' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 font-ui text-xs text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@example.com"
                    className={`input-field ${errors.email ? '!border-red-400' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 font-ui text-xs text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Address line 1 */}
              <div>
                <label className="input-label">Address Line 1</label>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={(e) => updateField('addressLine1', e.target.value)}
                  placeholder="House/Flat No., Street Name"
                  className={`input-field ${errors.addressLine1 ? '!border-red-400' : ''}`}
                />
                {errors.addressLine1 && (
                  <p className="mt-1 font-ui text-xs text-red-500">
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* Address line 2 */}
              <div>
                <label className="input-label">
                  Address Line 2{' '}
                  <span className="text-bark-light/40">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.addressLine2}
                  onChange={(e) => updateField('addressLine2', e.target.value)}
                  placeholder="Landmark, Area"
                  className="input-field"
                />
              </div>

              {/* City + State + Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="input-label">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Hyderabad"
                    className={`input-field ${errors.city ? '!border-red-400' : ''}`}
                  />
                  {errors.city && (
                    <p className="mt-1 font-ui text-xs text-red-500">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="input-label">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className={`input-field ${errors.state ? '!border-red-400' : ''}`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 font-ui text-xs text-red-500">
                      {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="input-label">Pincode</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) =>
                      updateField(
                        'pincode',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    placeholder="500001"
                    className={`input-field ${errors.pincode ? '!border-red-400' : ''}`}
                  />
                  {errors.pincode && (
                    <p className="mt-1 font-ui text-xs text-red-500">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items preview */}
          <div className="mt-6 bg-white border border-cream-deep/60 p-6">
            <h3 className="font-display text-lg font-semibold text-bark mb-4">
              Order Items
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.saree.id}
                  className="flex items-center justify-between py-2 border-b border-cream-deep/30 last:border-0"
                >
                  <div>
                    <p className="font-ui text-sm font-medium text-bark">
                      {item.saree.name}
                    </p>
                    <p className="font-ui text-xs text-bark-light">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-ui text-sm font-medium text-bark">
                    {formatINR(item.saree.priceInPaisa * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24">
          {paymentError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 font-ui text-sm">
              {paymentError}
            </div>
          )}
          <CartSummary
            showCheckoutButton
            onCheckout={handlePayment}
            checkoutLabel="Pay with Razorpay"
            loading={loading}
          />

          <div className="mt-4 p-4 bg-cream-warm border border-cream-deep/40">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-sage shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="font-ui text-xs text-bark-light leading-relaxed">
                Your payment is secured by Razorpay. We support UPI, cards,
                net banking, and wallets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
