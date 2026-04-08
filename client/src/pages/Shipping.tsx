import PolicyLayout from "@/components/PolicyLayout";
import { Link } from "wouter";

export default function Shipping() {
  return (
    <PolicyLayout
      title="Shipping Policy"
      subtitle="Fast, reliable delivery across India."
      lastUpdated="January 2026"
    >
      <h2>Shipping Overview</h2>
      <p>
        Thrifti ships pan-India through trusted courier partners. All orders are carefully packaged
        to ensure your pre-loved finds arrive in perfect condition. We currently ship within India only.
      </p>

      <h2>Processing Time</h2>
      <p>
        Once your order is placed and payment is confirmed, we process and dispatch it within
        <strong> 1–2 business days</strong>. Orders placed on Sundays or public holidays are
        processed on the next business day.
      </p>

      <h2>Delivery Timeframes</h2>
      <p>Estimated delivery times after dispatch:</p>
      <ul>
        <li><strong>Bangalore (local):</strong> 1–2 business days</li>
        <li><strong>Metro cities</strong> (Mumbai, Delhi, Chennai, Hyderabad, Kolkata, Pune): 2–4 business days</li>
        <li><strong>Tier 2 &amp; Tier 3 cities:</strong> 4–7 business days</li>
        <li><strong>Remote areas:</strong> 7–10 business days</li>
      </ul>
      <p>
        These are estimated timeframes and may vary due to courier delays, weather conditions,
        or other unforeseen circumstances.
      </p>

      <h2>Shipping Charges</h2>
      <p>
        Shipping charges are calculated at checkout based on your delivery location and order weight.
        We offer <strong>free shipping on orders above ₹999</strong>. For orders below this threshold,
        a flat shipping fee of ₹99 applies for most locations.
      </p>

      <h2>Order Tracking</h2>
      <p>
        Once your order is dispatched, you will receive a tracking number via email and WhatsApp.
        You can use this to track your shipment in real time on the courier's website.
        You can also check your order status in your <Link href="/account" className="text-[oklch(0.52_0.22_25)] underline">account dashboard</Link>.
      </p>

      <h2>Packaging</h2>
      <p>
        We take packaging seriously. All items are folded neatly, wrapped in tissue paper, and
        placed in a branded Thrifti bag before being sealed in a courier-safe outer packaging.
        We use minimal, recyclable packaging materials wherever possible — because sustainability
        doesn't stop at the clothes.
      </p>

      <h2>Failed Deliveries</h2>
      <p>
        If a delivery attempt fails due to an incorrect address or unavailability, the courier will
        attempt delivery up to 3 times. After 3 failed attempts, the package is returned to us.
        In such cases, re-delivery charges may apply. Please ensure your delivery address and
        contact number are accurate at checkout.
      </p>

      <h2>Lost or Delayed Shipments</h2>
      <p>
        If your order has not arrived within the estimated timeframe, please contact us on WhatsApp
        at <strong>+91 80652 53722</strong> or email <strong>hello@thrifti.in</strong>. We will
        investigate with the courier and provide an update within 48 hours.
      </p>

      <h2>International Shipping</h2>
      <p>
        We currently do not offer international shipping. We ship within India only.
        International shipping is on our roadmap — stay tuned.
      </p>

      <h2>Contact Us</h2>
      <p>
        For any shipping-related queries, reach us on WhatsApp at <strong>+91 80652 53722</strong> or
        email <strong>hello@thrifti.in</strong>. Visit our{" "}
        <Link href="/contact" className="text-[oklch(0.52_0.22_25)] underline">Contact Us</Link> page for more options.
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
