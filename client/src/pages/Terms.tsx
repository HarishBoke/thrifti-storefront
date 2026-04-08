import PolicyLayout from "@/components/PolicyLayout";
import { Link } from "wouter";

export default function Terms() {
  return (
    <PolicyLayout
      title="Terms of Use"
      subtitle="Please read these terms carefully before using Thrifti."
      lastUpdated="January 2026"
    >
      <p>
        These Terms of Use ("Terms") govern your access to and use of the Thrifti platform,
        including our website at thrifti.in and any related services (collectively, the "Platform"),
        operated by <strong>Meshi Commerce Pvt. Ltd</strong> ("Thrifti", "we", "us", or "our"),
        a company incorporated under the laws of India.
      </p>
      <p>
        By accessing or using the Platform, you agree to be bound by these Terms. If you do not
        agree, please do not use the Platform.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 18 years of age to use the Platform. By using Thrifti, you represent
        and warrant that you are 18 or older and have the legal capacity to enter into a binding
        agreement. If you are using the Platform on behalf of a business, you represent that you
        have authority to bind that business to these Terms.
      </p>

      <h2>2. Account Registration</h2>
      <p>
        To access certain features of the Platform, you may need to create an account. You agree to:
      </p>
      <ul>
        <li>Provide accurate, current, and complete information during registration.</li>
        <li>Maintain the security of your account credentials.</li>
        <li>Notify us immediately of any unauthorised use of your account.</li>
        <li>Accept responsibility for all activities that occur under your account.</li>
      </ul>

      <h2>3. Buying on Thrifti</h2>
      <p>
        When you purchase an item on Thrifti, you enter into a transaction with the seller of that item.
        Thrifti acts as a marketplace facilitator and is not the seller of record unless explicitly stated.
        All sales are final except as described in our <Link href="/returns" className="text-[oklch(0.52_0.22_25)] underline">Returns Policy</Link>.
      </p>
      <p>
        Prices listed are in Indian Rupees (INR) and include applicable taxes. Shipping charges are
        displayed at checkout. We reserve the right to cancel orders in cases of pricing errors or
        suspected fraudulent activity.
      </p>

      <h2>4. Selling on Thrifti</h2>
      <p>
        To sell on Thrifti, you must be onboarded through our WhatsApp seller process. By submitting
        items for listing, you represent that:
      </p>
      <ul>
        <li>You are the rightful owner of the items and have the right to sell them.</li>
        <li>The items are accurately described and in the condition stated.</li>
        <li>The items do not infringe any third-party intellectual property rights.</li>
        <li>The items comply with all applicable Indian laws and regulations.</li>
      </ul>
      <p>
        Thrifti reserves the right to reject, remove, or modify any listing at its sole discretion.
        Sellers receive 70% of the final sale price. The remaining 30% is retained by Thrifti as a
        platform commission.
      </p>

      <h2>5. Prohibited Items</h2>
      <p>The following items are strictly prohibited on the Platform:</p>
      <ul>
        <li>Counterfeit or replica goods</li>
        <li>Undergarments, swimwear, or intimate apparel</li>
        <li>Items that are heavily damaged, soiled, or unwearable</li>
        <li>Hazardous materials or items banned under Indian law</li>
        <li>Any item that infringes intellectual property rights</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        All content on the Platform, including text, graphics, logos, images, and software, is the
        property of Meshi Commerce Pvt. Ltd or its content suppliers and is protected by applicable
        intellectual property laws. You may not reproduce, distribute, or create derivative works
        without our express written permission.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Thrifti shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising from your use of the Platform.
        Our total liability to you for any claim arising from these Terms shall not exceed the amount
        you paid for the transaction giving rise to the claim.
      </p>

      <h2>8. Dispute Resolution</h2>
      <p>
        Any disputes arising from these Terms or your use of the Platform shall be governed by the
        laws of India. You agree to first attempt to resolve disputes informally by contacting us at
        hello@thrifti.in. If unresolved, disputes shall be subject to the exclusive jurisdiction of
        the courts of Bangalore, Karnataka, India.
      </p>

      <h2>9. Changes to These Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. Changes will be posted on this page
        with an updated "Last Updated" date. Continued use of the Platform after changes constitutes
        acceptance of the revised Terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        For questions about these Terms, contact us at <strong>hello@thrifti.in</strong> or
        visit our <Link href="/contact" className="text-[oklch(0.52_0.22_25)] underline">Contact Us</Link> page.
      </p>
      <p>
        <strong>Meshi Commerce Pvt. Ltd</strong><br />
        Bangalore, Karnataka, India<br />
        hello@thrifti.in
      </p>
    </PolicyLayout>
  );
}
