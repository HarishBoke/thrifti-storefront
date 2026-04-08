import PolicyLayout from "@/components/PolicyLayout";
import { Link } from "wouter";

export default function Returns() {
  return (
    <PolicyLayout
      title="Returns Policy"
      subtitle="We want you to love every Thrifti find."
      lastUpdated="January 2026"
    >
      <h2>Our Returns Philosophy</h2>
      <p>
        At Thrifti, every item is personally verified by our team before listing. We carefully check
        condition, sizing, and authenticity so that what you see in the photos is exactly what you receive.
        Because of the pre-loved nature of our inventory, our returns policy is designed to be fair to
        both buyers and sellers.
      </p>

      <h2>When Returns Are Accepted</h2>
      <p>We accept returns within <strong>48 hours of delivery</strong> in the following circumstances:</p>
      <ul>
        <li>The item received is significantly different from the listing description or photos.</li>
        <li>The item has undisclosed damage, stains, tears, or defects not mentioned in the listing.</li>
        <li>The item received is the wrong product (incorrect item shipped).</li>
        <li>The item has a sizing discrepancy of more than one full size from what was listed.</li>
      </ul>

      <h2>When Returns Are Not Accepted</h2>
      <p>We are unable to accept returns in the following cases:</p>
      <ul>
        <li>You changed your mind after purchase.</li>
        <li>The item fits differently than expected (minor fit variations are normal in pre-loved fashion).</li>
        <li>The item shows normal signs of pre-loved wear that were disclosed in the listing.</li>
        <li>The return request is made more than 48 hours after delivery confirmation.</li>
        <li>The item has been worn, washed, or altered after delivery.</li>
      </ul>

      <h2>How to Initiate a Return</h2>
      <p>To request a return, please follow these steps:</p>
      <ol>
        <li>Contact us within <strong>48 hours of delivery</strong> via WhatsApp at <strong>+91 80652 53722</strong> or email at <strong>hello@thrifti.in</strong>.</li>
        <li>Provide your order number and clear photographs showing the issue.</li>
        <li>Our team will review your request within 24 hours and confirm whether it qualifies for a return.</li>
        <li>If approved, we'll arrange a pickup from your address at no additional cost.</li>
        <li>Once the item is received and inspected, your refund will be processed.</li>
      </ol>

      <h2>Refund Process</h2>
      <p>
        Approved refunds are processed within <strong>5–7 business days</strong> of us receiving the returned item.
        Refunds are issued to the original payment method — credit/debit card, UPI, or wallet, as applicable.
        Please note that payment gateway processing times may vary.
      </p>

      <h2>Exchange Policy</h2>
      <p>
        Due to the one-of-a-kind nature of pre-loved items, direct exchanges are generally not possible.
        If your return is approved, we'll issue a refund and you're welcome to browse and purchase another item.
      </p>

      <h2>Damaged in Transit</h2>
      <p>
        If your item arrives damaged due to shipping, please photograph the packaging and item immediately
        and contact us within <strong>24 hours</strong>. We will file a claim with the courier and arrange a
        full refund or replacement at no cost to you.
      </p>

      <h2>Contact Us</h2>
      <p>
        For any returns-related queries, reach us on WhatsApp at <strong>+91 80652 53722</strong> or
        email <strong>hello@thrifti.in</strong>. You can also visit our{" "}
        <Link href="/contact" className="text-[oklch(0.52_0.22_25)] underline">Contact Us</Link> page.
      </p>

      <p>
        <em>
          Thrifti is operated by Meshi Commerce Pvt. Ltd, registered in Bangalore, India.
          This policy is subject to change. The most current version will always be available on this page.
        </em>
      </p>
    </PolicyLayout>
  );
}
