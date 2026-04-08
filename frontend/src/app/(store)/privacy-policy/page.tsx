import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Dhanunjaiah Handlooms. How we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-bold text-bark mb-2">Privacy Policy</h1>
      <div className="gold-divider mb-8" />
      <p className="font-ui text-xs text-bark-light/50 mb-8">Last updated: April 2026</p>

      <div className="prose-policy">
        <h2>Information We Collect</h2>
        <p>When you use dhanunjaiah.com, we may collect the following information:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number when you register</li>
          <li><strong>Order Information:</strong> Shipping address, payment details (processed securely by Razorpay), order history</li>
          <li><strong>Usage Data:</strong> Pages visited, products viewed, device information, IP address</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Process and deliver your orders</li>
          <li>Send order confirmations, shipping updates, and delivery notifications</li>
          <li>Provide customer support</li>
          <li>Improve our website and product offerings</li>
          <li>Send promotional emails (only with your consent — you can unsubscribe anytime)</li>
        </ul>

        <h2>Payment Security</h2>
        <p>All payments are processed securely through <strong>Razorpay</strong>. We do not store your credit card, debit card, or UPI details on our servers. Razorpay is PCI-DSS compliant and uses bank-grade encryption.</p>

        <h2>Data Sharing</h2>
        <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share data only with:</p>
        <ul>
          <li><strong>Payment processor</strong> (Razorpay) for processing transactions</li>
          <li><strong>Shipping partners</strong> for order delivery</li>
          <li><strong>Email service</strong> (AWS SES) for transactional emails</li>
        </ul>

        <h2>Cookies</h2>
        <p>We use essential cookies to maintain your login session and shopping cart. We may use analytics cookies (Google Analytics) to understand website usage. You can disable cookies in your browser settings.</p>

        <h2>Data Security</h2>
        <p>We implement industry-standard security measures including:</p>
        <ul>
          <li>HTTPS encryption on all pages</li>
          <li>Secure httpOnly cookies for authentication</li>
          <li>Passwords stored with BCrypt hashing</li>
          <li>HMAC signature verification for payments</li>
        </ul>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your account and data</li>
          <li>Opt out of promotional communications</li>
        </ul>
        <p>To exercise these rights, contact us at <a href="mailto:ch.dhanunjaiah@gmail.com">ch.dhanunjaiah@gmail.com</a>.</p>

        <h2>Changes to This Policy</h2>
        <p>We may update this privacy policy from time to time. Changes will be posted on this page with the updated date.</p>

        <h2>Contact</h2>
        <p>Dhanunjaiah Handlooms<br/>Gattuppal, Nalgonda District<br/>Telangana 508253<br/>
        Email: <a href="mailto:ch.dhanunjaiah@gmail.com">ch.dhanunjaiah@gmail.com</a><br/>
        Phone: <a href="tel:+919440249456">+91 94402 49456</a></p>
      </div>
    </div>
  );
}
