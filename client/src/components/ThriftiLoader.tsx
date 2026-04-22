import { useEffect, useState } from "react";

const MESSAGES = [
  "Checking your wardrobe...",
  "Hunting for hidden gems...",
  "Tagging your finds...",
  "Sorting through the racks...",
  "Almost there...",
];

interface ThriftiLoaderProps {
  visible: boolean;
  message?: string;
}

export default function ThriftiLoader({ visible, message }: ThriftiLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const displayMsg = message ?? MESSAGES[msgIndex];

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
      aria-label="Loading"
      role="status"
    >
      {/* Animated hanger + swinging tag */}
      <div className="relative flex flex-col items-center mb-8 select-none">
        {/* Hanger SVG */}
        <svg
          width="96"
          height="80"
          viewBox="0 0 96 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-[swing_1.2s_ease-in-out_infinite]"
          style={{ transformOrigin: "48px 4px" }}
        >
          {/* Hook */}
          <path
            d="M48 4 C48 4 48 0 52 0 C56 0 58 4 56 7 C54 10 48 12 48 12"
            stroke="#1F1F22"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Hanger bar */}
          <path
            d="M48 12 C48 12 38 22 8 28 C4 29 2 32 4 35 C6 38 10 37 14 36 L82 36 C86 37 90 38 92 35 C94 32 92 29 88 28 C58 22 48 12 48 12Z"
            fill="#1F1F22"
          />
          {/* Price tag */}
          <g className="animate-[tagSwing_1.2s_ease-in-out_infinite]" style={{ transformOrigin: "70px 36px" }}>
            <line x1="70" y1="36" x2="70" y2="48" stroke="#F42824" strokeWidth="1.5" />
            <rect x="60" y="48" width="20" height="14" rx="2" fill="#F42824" />
            <circle cx="70" cy="48" r="1.5" fill="white" />
            <line x1="64" y1="53" x2="76" y2="53" stroke="white" strokeWidth="1.2" />
            <line x1="64" y1="57" x2="72" y2="57" stroke="white" strokeWidth="1.2" />
          </g>
        </svg>

        {/* Bouncing dots below hanger */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-2 h-2 rounded-full bg-[#F42824]"
              style={{
                animation: `bounce 0.9s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Message */}
      <p
        key={displayMsg}
        className="text-sm font-medium text-[#1F1F22] geist-mono-font tracking-wide animate-[fadeIn_0.4s_ease]"
      >
        {displayMsg}
      </p>

      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(-6deg); }
          50%       { transform: rotate(6deg); }
        }
        @keyframes tagSwing {
          0%, 100% { transform: rotate(8deg); }
          50%       { transform: rotate(-8deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
