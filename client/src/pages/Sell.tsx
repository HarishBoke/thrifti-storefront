import { useState } from "react";
import { MessageCircle, Camera, DollarSign, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STEPS = [
  {
    icon: MessageCircle,
    step: "01",
    title: "PING US",
    desc: 'Shoot us a "Hey!, Hi!" on WhatsApp. We\'ll guide you through the rest.',
    color: "bg-[oklch(0.52_0.22_25)]",
  },
  {
    icon: Camera,
    step: "02",
    title: "SNAP",
    desc: "Take a clean photo of your item. Good lighting = faster listing = quicker sale.",
    color: "bg-[oklch(0.12_0.01_260)]",
  },
  {
    icon: DollarSign,
    step: "03",
    title: "SELL",
    desc: "Get paid & ship with our concierge service. We handle the logistics.",
    color: "bg-[oklch(0.52_0.22_25)]",
  },
];

const CONDITIONS = ["Brand New with Tags", "Like New", "Excellent", "Good", "Fair"];
const PRODUCT_TYPES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Footwear", "Accessories", "Bags", "Other"];

export default function Sell() {
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    productType: "",
    condition: "",
    size: "",
    color: "",
    additionalDetails: "",
    imageUrl: "",
  });
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const generateMutation = trpc.ai.generateDescription.useMutation({
    onSuccess: (data) => {
      setGeneratedDescription(data.description);
      toast.success("Description generated!");
    },
    onError: () => {
      toast.error("Failed to generate description. Please try again.");
    },
  });

  const handleGenerate = () => {
    if (!form.productName.trim()) {
      toast.error("Please enter a product name first.");
      return;
    }
    generateMutation.mutate(form);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    setCopied(true);
    toast.success("Description copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="bg-[oklch(0.12_0.01_260)] text-white py-16 sm:py-20">
        <div className="container">
          <div className="max-w-2xl">
            <p
              className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sell on Thrifti
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5 text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Your Wardrobe<br />
              Is A Transition<br />
              Fund
            </h1>
            <p className="text-white/70 text-lg mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
              List in less than 60 seconds. Literally.
            </p>
            <a
              href="https://wa.me/918065253722?text=Hey!+I+want+to+sell+on+Thrifti"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-8 py-4 text-base gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Start Selling on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 sm:py-20 bg-[oklch(0.97_0.01_80)]">
        <div className="container">
          <div className="text-center mb-12">
            <p
              className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Simple Process
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              How to Sell
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                <div className={`${step.color} text-white rounded-sm p-6 sm:p-8 h-full`}>
                  <div className="flex items-start justify-between mb-4">
                    <step.icon className="w-8 h-8 text-white/80" />
                    <span
                      className="text-4xl font-black text-white/20"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {step.step}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-bold mb-2 text-white tracking-wider"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {step.desc}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-4 w-8 text-center text-muted-foreground z-10">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LLM Description Generator */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <p
              className="text-[oklch(0.52_0.22_25)] text-xs font-semibold tracking-[0.3em] uppercase mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AI-Powered Tool
            </p>
            <h2
              className="text-3xl sm:text-4xl font-black text-foreground mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Description Generator
            </h2>
            <p className="text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
              Fill in your item details and let AI write a compelling product description for you.
            </p>
          </div>

          <div className="bg-[oklch(0.97_0.01_80)] rounded-sm p-6 sm:p-8 border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Product Name *
                </Label>
                <Input
                  value={form.productName}
                  onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                  placeholder="e.g. Vintage Denim Jacket"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Brand
                </Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="e.g. Levi's, Zara, H&M"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Category
                </Label>
                <Select
                  value={form.productType}
                  onValueChange={(v) => setForm((f) => ({ ...f, productType: v }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Condition
                </Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => setForm((f) => ({ ...f, condition: v }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Size
                </Label>
                <Input
                  value={form.size}
                  onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                  placeholder="e.g. M, L, 32, UK8"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Color
                </Label>
                <Input
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  placeholder="e.g. Indigo Blue"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Additional Details
              </Label>
              <Textarea
                value={form.additionalDetails}
                onChange={(e) => setForm((f) => ({ ...f, additionalDetails: e.target.value }))}
                placeholder="Any special features, flaws, or styling notes..."
                className="bg-white resize-none"
                rows={3}
              />
            </div>

            <div className="mb-6">
              <Label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Product Image URL (optional)
              </Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="bg-white"
                type="url"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !form.productName.trim()}
              className="w-full bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white font-semibold py-3 gap-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Sparkles className="w-4 h-4" />
              {generateMutation.isPending ? "Generating..." : "Generate Description with AI"}
            </Button>

            {/* Generated Description */}
            {generatedDescription && (
              <div className="mt-5 p-4 bg-white rounded-sm border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.52_0.22_25)]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Generated Description
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs gap-1"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {generatedDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </StorefrontLayout>
  );
}
