import { Upload } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";

export default function SellItems() {
  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-[#ECE9E2]">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[760px]">
            <h1 className="anek-devanagari-font text-2xl lg:text-[40px] font-semibold leading-none text-[#1F1F22]">
              Sell You items
            </h1>
            <p className="geist-mono-font mt-3 text-sm lg:text-base leading-relaxed text-[#1F1F22] lg:w-[80ch]">
              Turn your pre-loved fashion into cash. List your items and reach thousands of
              buyers looking for sustainable fashion.
            </p>

            <div className="mt-6 rounded-[4px] border border-[#D9D4CB] bg-[#F5F3EF] p-4 lg:p-8 shadow-lg shadow-[#000000]/10">
              <h2 className="anek-devanagari-font text-xl lg:text-3xl font-semibold leading-none text-[#1F1F22]">
                Create Your Listing
              </h2>

              <form className="mt-6">
                <div>
                  <label className="geist-mono-font mb-2 font-semibold text-sm lg:text-base text-[#1F1F22]">
                    Photos (up to 5)
                  </label>
                  <button
                    type="button"
                    className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-[4px] border border-dashed border-[#C8C2B8] bg-[#ECE9E2] text-[#A09B92]"
                  >
                    <Upload size={14} />
                    <span className="geist-mono-font mt-2 text-[9px]">Upload</span>
                  </button>
                </div>

                <div className="mt-4">
                  <label className="geist-mono-font mb-1.5 block text-[11px] text-[#1F1F22]">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Vintage Denim Jacket"
                    className="geist-mono-font h-11 w-full rounded-[4px] border border-[#E2DDD4] bg-[#E9E6E1] px-3 text-sm text-[#1F1F22] outline-none placeholder:text-[#A09B92] focus:border-[#C8C2B8]"
                  />
                </div>

                <div className="mt-4">
                  <label className="geist-mono-font mb-1.5 block text-[11px] text-[#1F1F22]">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your item, including condition, measurements, and any unique features..."
                    className="geist-mono-font w-full resize-none rounded-[4px] border border-[#E2DDD4] bg-[#E9E6E1] px-3 py-2.5 text-sm text-[#1F1F22] outline-none placeholder:text-[#A09B92] focus:border-[#C8C2B8]"
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="geist-mono-font mb-1.5 block text-[11px] text-[#1F1F22]">
                      Category *
                    </label>
                    <input
                      type="text"
                      className="geist-mono-font h-11 w-full rounded-[4px] border border-[#E2DDD4] bg-[#E9E6E1] px-3 text-sm text-[#1F1F22] outline-none focus:border-[#C8C2B8]"
                    />
                  </div>
                  <div>
                    <label className="geist-mono-font mb-1.5 block text-[11px] text-[#1F1F22]">
                      Price (usd) *
                    </label>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="geist-mono-font h-11 w-full rounded-[4px] border border-[#E2DDD4] bg-[#E9E6E1] px-3 text-sm text-[#1F1F22] outline-none placeholder:text-[#A09B92] focus:border-[#C8C2B8]"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="geist-mono-font mb-1.5 block text-[11px] text-[#1F1F22]">
                      Condition *
                    </label>
                    <input
                      type="text"
                      className="geist-mono-font h-11 w-full rounded-[4px] border border-[#E2DDD4] bg-[#E9E6E1] px-3 text-sm text-[#1F1F22] outline-none focus:border-[#C8C2B8]"
                    />
                  </div>
                  <div>
                    <label className="geist-mono-font mb-1.5 block text-[11px] text-[#1F1F22]">
                      Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., M, 32"
                      className="geist-mono-font h-11 w-full rounded-[4px] border border-[#E2DDD4] bg-[#E9E6E1] px-3 text-sm text-[#1F1F22] outline-none placeholder:text-[#A09B92] focus:border-[#C8C2B8]"
                    />
                  </div>
                  <div>
                    <label className="geist-mono-font mb-1.5 block text-[11px] text-[#1F1F22]">
                      Brand
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Levi's"
                      className="geist-mono-font h-11 w-full rounded-[4px] border border-[#E2DDD4] bg-[#E9E6E1] px-3 text-sm text-[#1F1F22] outline-none placeholder:text-[#A09B92] focus:border-[#C8C2B8]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="geist-mono-font mt-6 h-12 w-full rounded-[4px] bg-[#1E1F26] text-sm font-semibold text-[#F5F1EA] transition-colors hover:bg-[#15161C]"
                >
                  Submit Listing
                </button>

                <p className="geist-mono-font mt-3 text-center text-[9px] text-[#8A857D]">
                  By submitting, you agree to our seller terms and conditions
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
