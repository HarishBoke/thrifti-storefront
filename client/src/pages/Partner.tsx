import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StorefrontLayout from "@/components/StorefrontLayout";
import { MessageCircle, Store, Users, Shirt, Handshake } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "918065253722";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hey!%20I%20want%20to%20partner%20with%20Thrifti`;

const PARTNER_TYPES = [
  {
    icon: Store,
    title: "Boutiques & Vintage Stores",
    desc: "List your slow-moving inventory on Thrifti and reach a new generation of conscious fashion buyers. We handle the digital storefront — you focus on curation.",
  },
  {
    icon: Users,
    title: "Influencers & Stylists",
    desc: "Turn your wardrobe into a revenue stream. As a Thrifti style partner, you get a dedicated seller profile, priority listing, and a share of every sale.",
  },
  {
    icon: Shirt,
    title: "Fashion Brands",
    desc: "Launch a certified pre-owned program for your brand on Thrifti. We help you extend your product lifecycle, build brand loyalty, and meet sustainability goals.",
  },
  {
    icon: Handshake,
    title: "Corporate & Bulk Sellers",
    desc: "Have a large wardrobe to clear? Corporate gifting returns? We offer white-glove bulk listing services for organisations looking to sell at scale.",
  },
];

const BENEFITS = [
  { stat: "70%", label: "Revenue share for partners" },
  { stat: "24h", label: "Average listing turnaround" },
  { stat: "0", label: "Upfront listing fees" },
  { stat: "Pan-India", label: "Delivery coverage" },
];

export default function Partner() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.type) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Partnership enquiry received! We'll be in touch within 48 hours.");
    setForm({ name: "", email: "", phone: "", type: "", message: "" });
    setSubmitting(false);
  };

  return (
    <StorefrontLayout>
      {/* Hero */}
      <div className="bg-[oklch(0.12_0.01_260)] text-white py-16 sm:py-24 text-center">
        <div className="container max-w-3xl mx-auto">
          <p
            className="text-white/50 text-xs font-bold tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Grow With Us
          </p>
          <h1
            className="text-5xl sm:text-7xl font-black mb-5 leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Partner Up
          </h1>
          <p className="text-white/70 text-lg leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Join the Thrifti ecosystem. Whether you're a boutique, a stylist, a brand, or a bulk seller —
            there's a place for you in India's circular fashion movement.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[oklch(0.52_0.22_25)] py-10">
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
            {BENEFITS.map((b) => (
              <div key={b.label}>
                <p
                  className="text-3xl sm:text-4xl font-black mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {b.stat}
                </p>
                <p className="text-white/70 text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {b.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Types */}
      <div className="container max-w-5xl mx-auto py-14 sm:py-20">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-black"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Who We Partner With
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PARTNER_TYPES.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="border border-border rounded-sm p-7 hover:border-[oklch(0.52_0.22_25)] transition-colors">
                <div className="w-12 h-12 bg-[oklch(0.12_0.01_260)] rounded-sm flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="text-lg font-black mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {p.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Partnership Form */}
      <div className="bg-[oklch(0.97_0.01_80)] py-14 sm:py-20">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl font-black mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Apply to Partner
            </h2>
            <p className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
              Fill out the form below and our partnerships team will reach out within 48 hours.
              Or message us directly on WhatsApp for a faster response.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-sm p-8 border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Name <span className="text-[oklch(0.52_0.22_25)]">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="rounded-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Email <span className="text-[oklch(0.52_0.22_25)]">*</span>
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="rounded-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Phone
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="rounded-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Partnership Type <span className="text-[oklch(0.52_0.22_25)]">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select a type...</option>
                <option value="boutique">Boutique / Vintage Store</option>
                <option value="influencer">Influencer / Stylist</option>
                <option value="brand">Fashion Brand</option>
                <option value="bulk">Corporate / Bulk Seller</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Tell Us More
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your business, what you'd like to sell, and how you'd like to partner with Thrifti..."
                rows={5}
                className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[oklch(0.12_0.01_260)] hover:bg-[oklch(0.2_0.01_260)] text-white font-bold py-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button
                  type="button"
                  className="w-full bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white font-bold py-5 gap-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </form>
        </div>
      </div>
    </StorefrontLayout>
  );
}
