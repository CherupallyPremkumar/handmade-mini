import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description: 'Return and refund policy for Dhanunjaiah Handlooms. 7-day return window for handwoven sarees.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-bold text-bark mb-2">Return & Refund Policy</h1>
      <div className="gold-divider mb-8" />

      <div className="prose-policy">
        <h2>Return Window</h2>
        <p>We accept returns within <strong>7 days</strong> of delivery. The item must be unused, unwashed, and in its original packaging with all tags intact.</p>

        <h2>Eligible for Return</h2>
        <ul>
          <li>Product received is damaged or defective</li>
          <li>Wrong product delivered</li>
          <li>Product significantly different from the description or images</li>
        </ul>

        <h2>Not Eligible for Return</h2>
        <ul>
          <li>Product has been used, washed, or altered</li>
          <li>Tags or packaging removed</li>
          <li>Return requested after 7 days of delivery</li>
          <li>Minor color variations due to monitor settings (handwoven products may have slight variations which are a mark of authenticity)</li>
        </ul>

        <h2>How to Initiate a Return</h2>
        <ol>
          <li>Contact us within 7 days of delivery at <a href="mailto:ch.dhanunjaiah@gmail.com">ch.dhanunjaiah@gmail.com</a> or call <a href="tel:+919440249456">+91 94402 49456</a></li>
          <li>Share your order number and reason for return</li>
          <li>Our team will review and confirm the return</li>
          <li>We will arrange a pickup or provide a return shipping label</li>
        </ol>

        <h2>Refund Process</h2>
        <ul>
          <li>Refunds are initiated within <strong>3-5 business days</strong> after we receive and inspect the returned item</li>
          <li>Refund will be credited to the original payment method</li>
          <li>Bank processing may take an additional 5-7 business days</li>
        </ul>

        <h2>Exchange</h2>
        <p>We currently do not offer direct exchanges. Please return the item and place a new order for the desired product.</p>

        <h2>Damaged in Transit</h2>
        <p>If your saree arrives damaged, please share photos of the damaged package and product within 24 hours of delivery. We will arrange a replacement or full refund at no extra cost.</p>

        <h2>Contact Us</h2>
        <p>For return-related queries:</p>
        <ul>
          <li>Phone: <a href="tel:+919440249456">+91 94402 49456</a></li>
          <li>Email: <a href="mailto:ch.dhanunjaiah@gmail.com">ch.dhanunjaiah@gmail.com</a></li>
        </ul>
      </div>
    </div>
  );
}
