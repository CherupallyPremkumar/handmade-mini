import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for using Dhanunjaiah Handlooms ecommerce store.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-bold text-bark mb-2">Terms & Conditions</h1>
      <div className="gold-divider mb-8" />
      <p className="font-ui text-xs text-bark-light/50 mb-8">Last updated: April 2026</p>

      <div className="prose-policy">
        <h2>Acceptance of Terms</h2>
        <p>By accessing and using dhanunjaiah.com, you agree to be bound by these terms and conditions. If you do not agree, please do not use our website.</p>

        <h2>Products</h2>
        <ul>
          <li>All sarees are <strong>handwoven</strong>. Slight variations in color, pattern, and texture are natural and a mark of authenticity.</li>
          <li>Product images are as accurate as possible, but colors may vary slightly due to monitor settings and photography lighting.</li>
          <li>Product availability is subject to stock. We reserve the right to limit quantities.</li>
        </ul>

        <h2>Pricing</h2>
        <ul>
          <li>All prices are in Indian Rupees (INR) and include applicable GST</li>
          <li>Prices are subject to change without prior notice</li>
          <li>The price at the time of order placement will be the final price</li>
        </ul>

        <h2>Orders</h2>
        <ul>
          <li>An order is confirmed only after successful payment</li>
          <li>We reserve the right to cancel an order if the product is out of stock, payment verification fails, or we suspect fraudulent activity</li>
          <li>In case of cancellation by us, a full refund will be issued</li>
        </ul>

        <h2>Payment</h2>
        <ul>
          <li>We accept payments via Razorpay (Credit Card, Debit Card, UPI, Net Banking, Wallets)</li>
          <li>All transactions are secured with industry-standard encryption</li>
          <li>Payment must be completed within 30 minutes of order creation, after which the order will be automatically cancelled</li>
        </ul>

        <h2>User Accounts</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You must provide accurate and complete information during registration</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
        </ul>

        <h2>Intellectual Property</h2>
        <p>All content on this website — including product images, descriptions, logos, and design — is the property of Dhanunjaiah Handlooms and protected by copyright laws. You may not reproduce, distribute, or use any content without written permission.</p>

        <h2>Limitation of Liability</h2>
        <p>Dhanunjaiah Handlooms shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products, except as required by applicable Indian law.</p>

        <h2>Governing Law</h2>
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Nalgonda, Telangana.</p>

        <h2>Contact</h2>
        <p>For questions about these terms:<br/>
        Email: <a href="mailto:ch.dhanunjaiah@gmail.com">ch.dhanunjaiah@gmail.com</a><br/>
        Phone: <a href="tel:+919440249456">+91 94402 49456</a></p>
      </div>
    </div>
  );
}
