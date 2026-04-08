export default function AnimatedBanner() {
  const segment = "SELL * EVOLVE * BUY   ";
  const repeated = segment.repeat(16);

  return (
    <div
      className="overflow-hidden py-3"
      style={{ backgroundColor: "var(--thrifti-red)" }}
      aria-label="Thrifti tagline banner"
    >
      <div
        className="whitespace-nowrap"
        style={{
          display: "inline-flex",
          animation: "ticker 22s linear infinite",
        }}
      >
        <span
          className="text-white font-black text-sm sm:text-base"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.12em",
          }}
        >
          {repeated}
        </span>
        <span
          className="text-white font-black text-sm sm:text-base"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.12em",
          }}
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
