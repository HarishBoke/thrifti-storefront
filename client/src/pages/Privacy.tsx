import PolicyLayout from "@/components/PolicyLayout";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="Your data, handled with care."
      lastUpdated="January 2026"
    >
      <p>
        This Privacy Policy describes how <strong>Meshi Commerce Pvt. Ltd</strong> ("Thrifti", "we",
        "us", or "our") collects, uses, and shares information about you when you use our platform
        at thrifti.in and related services (the "Platform").
      </p>
      <p>
        By using the Platform, you agree to the collection and use of information as described in
        this policy. If you do not agree, please do not use the Platform.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>Information You Provide</h3>
      <ul>
        <li><strong>Account information:</strong> Name, email address, and login credentials when you create an account.</li>
        <li><strong>Order information:</strong> Shipping address, phone number, and payment details when you place an order.</li>
        <li><strong>Seller information:</strong> Bank account or UPI details for processing seller payouts.</li>
        <li><strong>Communications:</strong> Messages you send us via WhatsApp, email, or our contact form.</li>
      </ul>

      <h3>Information We Collect Automatically</h3>
      <ul>
        <li><strong>Usage data:</strong> Pages visited, time spent, clicks, and navigation patterns on the Platform.</li>
        <li><strong>Device information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
        <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to improve your experience. See our Cookie Policy below.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and fulfil your orders, including payment and delivery.</li>
        <li>Create and manage your account.</li>
        <li>Communicate with you about your orders, listings, and account.</li>
        <li>Send you promotional communications (with your consent, and you can opt out at any time).</li>
        <li>Improve and personalise the Platform experience.</li>
        <li>Detect and prevent fraud and abuse.</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>3. Sharing Your Information</h2>
      <p>We do not sell your personal information. We may share your information with:</p>
      <ul>
        <li><strong>Courier partners:</strong> Your name, address, and phone number are shared with our logistics partners to fulfil deliveries.</li>
        <li><strong>Payment processors:</strong> Payment information is processed by our payment gateway partners (Shopify Payments, Razorpay, etc.) and is not stored on our servers.</li>
        <li><strong>Service providers:</strong> We use third-party services for analytics, customer support, and marketing, who process data on our behalf under data processing agreements.</li>
        <li><strong>Legal requirements:</strong> We may disclose information if required by law, court order, or government authority.</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain your personal information for as long as your account is active or as needed to
        provide services. Order records are retained for 7 years as required by Indian tax laws.
        You may request deletion of your account and associated data at any time by contacting us.
      </p>

      <h2>5. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
        <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
        <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements).</li>
        <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time.</li>
      </ul>
      <p>
        To exercise these rights, contact us at <strong>hello@thrifti.in</strong>.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use cookies to remember your preferences, keep you logged in, and understand how you use
        the Platform. You can control cookies through your browser settings. Disabling cookies may
        affect some functionality of the Platform.
      </p>

      <h2>7. Security</h2>
      <p>
        We implement industry-standard security measures to protect your personal information,
        including SSL encryption for data in transit and secure storage practices. However, no
        method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        The Platform is not directed at children under 18. We do not knowingly collect personal
        information from minors. If you believe a minor has provided us with personal information,
        please contact us and we will delete it promptly.
      </p>

      <h2>9. Third-Party Links</h2>
      <p>
        The Platform may contain links to third-party websites. We are not responsible for the
        privacy practices of those sites and encourage you to review their privacy policies.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page
        with an updated "Last Updated" date. We will notify you of significant changes via email
        or a prominent notice on the Platform.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        For privacy-related questions or to exercise your rights, contact us at:
      </p>
      <p>
        <strong>Meshi Commerce Pvt. Ltd</strong><br />
        Email: <strong>hello@thrifti.in</strong><br />
        WhatsApp: <strong>+91 80652 53722</strong><br />
        Bangalore, Karnataka, India
      </p>
      <p>
        You can also visit our <Link href="/contact" className="text-[oklch(0.52_0.22_25)] underline">Contact Us</Link> page.
      </p>
    </PolicyLayout>
  );
}
