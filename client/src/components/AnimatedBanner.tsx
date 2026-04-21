export default function AnimatedBanner() {
  const segment = "SELL * EVOLVE * BUY   ";
  const repeated = segment.repeat(16);

  return (
    <div className="overflow-hidden py-3 bg-[var(--thrifti-red)]" aria-label="Thrifti tagline banner">
      <div
        className="whitespace-nowrap inline-flex animate-[ticker_22s_linear_infinite]"
      >
        <span
          className="text-white font-black text-sm sm:text-base font-['Space_Grotesk'] tracking-[0.12em]"
        >
          {repeated}
        </span>
        <span
          className="text-white font-black text-sm sm:text-base font-['Space_Grotesk'] tracking-[0.12em]"
        >
          {repeated}
        </span>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
