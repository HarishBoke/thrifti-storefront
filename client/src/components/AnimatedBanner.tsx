export default function AnimatedBanner() {
  const items = Array(12).fill("SELL * EVOLVE * BUY");
  const text = items.join("   ");

  return (
    <div
      className="overflow-hidden bg-[oklch(0.52_0.22_25)] py-2.5"
      aria-label="Thrifti tagline banner"
    >
      <div className="flex">
        <div
          className="whitespace-nowrap"
          style={{
            animation: "ticker 25s linear infinite",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {Array(3)
            .fill(null)
            .map((_, i) => (
              <span
                key={i}
                className="text-white text-xs sm:text-sm font-grotesk font-semibold tracking-[0.2em] uppercase px-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {text}
              </span>
            ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
