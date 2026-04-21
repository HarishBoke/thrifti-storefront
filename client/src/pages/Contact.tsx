import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StorefrontLayout from "@/components/StorefrontLayout";
import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "918065253722";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hey%20Thrifti!%20I%20have%20a%20question`;

const CONTACT_INFO = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+91 80652 53722",
    sub: "Fastest response — usually within a few hours",
    href: WHATSAPP_URL,
  },
  {
    icon: Mail,
    title: "Email",
    value: "hello@thrifti.in",
    sub: "For detailed queries and partnership inquiries",
    href: "mailto:hello@thrifti.in",
  },
  {
    icon: MapPin,
    title: "Based In",
    value: "Bangalore, India",
    sub: "Built for Bangalore. Made for India.",
    href: null,
  },
  {
    icon: Clock,
    title: "Business Hours",
    value: "Mon – Sat, 10am – 7pm IST",
    sub: "We're closed on Sundays and public holidays",
    href: null,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    // Simulate form submission
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSubmitting(false);
  };

  return (
    <StorefrontLayout>
      {/* Hero */}
      <div className="bg-[oklch(0.12_0.01_260)] text-white py-16 sm:py-24 text-center">
        <div className="container max-w-2xl mx-auto">
          <p
            className="text-white/50 text-xs font-bold tracking-[0.35em] uppercase mb-4 font-['Space_Grotesk']"
          >
            We'd Love to Hear From You
          </p>
          <h1
            className="text-5xl sm:text-7xl font-black mb-5 leading-none font-['Playfair_Display']"
          >
            Contact Us
          </h1>
          <p className="text-white/70 leading-relaxed font-['Inter']">
            Whether you have a question about selling, an order issue, or just want to say hi —
            we're here and happy to help.
          </p>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Info */}
          <div>
            <h2
              className="text-2xl font-black mb-8 font-['Playfair_Display']"
            >
              Get in Touch
            </h2>

            <div className="space-y-6 mb-10">
              {CONTACT_INFO.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex gap-4 items-start">
                    <div className="w-11 h-11 bg-[oklch(0.52_0.22_25)] rounded-sm flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p
                        className="font-bold text-sm mb-0.5 font-['Space_Grotesk']"
                      >
                        {item.title}
                      </p>
                      <p
                        className="text-base font-semibold font-['Inter']"
                      >
                        {item.value}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5 font-['Inter']">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                );
                return item.href ? (
                  <a
                    key={item.title}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.title}>{content}</div>
                );
              })}
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-[oklch(0.52_0.22_25)] rounded-sm p-6 text-white">
              <h3
                className="font-black text-lg mb-2 font-['Playfair_Display']"
              >
                Fastest Way to Reach Us
              </h3>
              <p className="text-white/80 text-sm mb-4 font-['Inter']">
                For quick answers, WhatsApp is the best channel. Our team responds within a few hours during business hours.
              </p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  className="bg-white text-[oklch(0.52_0.22_25)] hover:bg-white/90 font-bold gap-2 w-full sm:w-auto font-['Space_Grotesk']"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2
              className="text-2xl font-black mb-8 font-['Playfair_Display']"
            >
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5 font-['Space_Grotesk']"
                  >
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
                  <label
                    className="block text-sm font-semibold mb-1.5 font-['Space_Grotesk']"
                  >
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
                <label
                  className="block text-sm font-semibold mb-1.5 font-['Space_Grotesk']"
                >
                  Subject
                </label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What's this about?"
                  className="rounded-sm"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5 font-['Space_Grotesk']"
                >
                  Message <span className="text-[oklch(0.52_0.22_25)]">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  rows={6}
                  className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[oklch(0.12_0.01_260)] hover:bg-[oklch(0.2_0.01_260)] text-white font-bold py-5 font-['Space_Grotesk']"
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
