import type { RazorpayOptions } from './types';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

let scriptLoaded = false;

/**
 * Dynamically load Razorpay checkout.js SDK.
 */
export function loadRazorpayScript(): Promise<boolean> {
  if (scriptLoaded && window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay payment modal.
 *
 * @param options - Razorpay checkout options
 * @returns true if modal opened, false if SDK failed to load
 */
export async function openRazorpayModal(
  options: RazorpayOptions
): Promise<boolean> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    console.error('Failed to load Razorpay SDK');
    return false;
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
  return true;
}

/**
 * Build Razorpay options for a checkout.
 */
export function buildRazorpayOptions(params: {
  orderId: string;
  amountInPaisa: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
}): RazorpayOptions {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_placeholder',
    amount: params.amountInPaisa,
    currency: 'INR',
    name: 'Dhanunjaiah Handlooms',
    description: 'Authentic Ikat Sarees',
    order_id: params.orderId,
    prefill: {
      name: params.customerName,
      email: params.customerEmail,
      contact: params.customerPhone,
    },
    theme: {
      color: '#8B1A1A',
    },
    handler: params.onSuccess,
  };
}
