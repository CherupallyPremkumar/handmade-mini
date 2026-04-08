import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Shipping information for Dhanunjaiah Handlooms. Free shipping on orders above ₹999. We ship across India.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-bold text-bark mb-2">Shipping Policy</h1>
      <div className="gold-divider mb-8" />

      <div className="prose-policy">
        <h2>Delivery Across India</h2>
        <p>We deliver to all serviceable pin codes across India. Our sarees are carefully packed to ensure they reach you in perfect condition.</p>

        <h2>Shipping Charges</h2>
        <ul>
          <li><strong>Free Shipping</strong> on orders above ₹999</li>
          <li><strong>₹99 flat rate</strong> for orders below ₹999</li>
        </ul>

        <h2>Processing Time</h2>
        <p>Orders are processed within <strong>1-2 business days</strong>. You will receive a confirmation email once your order is dispatched with tracking details.</p>

        <h2>Delivery Time</h2>
        <ul>
          <li><strong>Metro cities:</strong> 3-5 business days</li>
          <li><strong>Other cities:</strong> 5-7 business days</li>
          <li><strong>Remote areas:</strong> 7-10 business days</li>
        </ul>

        <h2>Tracking Your Order</h2>
        <p>Once shipped, you will receive a tracking number via email and SMS. You can also track your order on our <a href="/track">Track Order</a> page using your order number.</p>

        <h2>Packaging</h2>
        <p>Each saree is carefully folded with tissue paper and packed in a branded box to preserve the fabric quality during transit.</p>

        <h2>International Shipping</h2>
        <p>We currently ship only within India. For international orders, please contact us at <a href="mailto:ch.dhanunjaiah@gmail.com">ch.dhanunjaiah@gmail.com</a> for custom shipping arrangements.</p>

        <h2>Contact Us</h2>
        <p>For any shipping-related queries, reach us at:</p>
        <ul>
          <li>Phone: <a href="tel:+919440249456">+91 94402 49456</a></li>
          <li>Email: <a href="mailto:ch.dhanunjaiah@gmail.com">ch.dhanunjaiah@gmail.com</a></li>
        </ul>
      </div>
    </div>
  );
}
