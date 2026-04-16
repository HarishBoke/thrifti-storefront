import { useEffect, useRef } from "react";
import { X, Link2, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  image?: string;
}

const SHARE_CHANNELS = [
  {
    name: "WhatsApp",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-7 h-7">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.51L4 29l7.697-1.813A11.94 11.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.5a9.46 9.46 0 01-4.83-1.322l-.347-.207-3.6.848.862-3.505-.226-.36A9.46 9.46 0 016.5 15c0-5.238 4.262-9.5 9.5-9.5S25.5 9.762 25.5 15 21.238 24.5 16 24.5zm5.2-7.1c-.285-.143-1.688-.833-1.95-.928-.262-.095-.452-.143-.643.143-.19.285-.738.928-.905 1.118-.167.19-.333.214-.618.071-.285-.143-1.203-.443-2.29-1.413-.847-.755-1.42-1.687-1.587-1.972-.167-.285-.018-.44.125-.582.128-.127.285-.333.428-.5.143-.167.19-.285.285-.476.095-.19.048-.357-.024-.5-.071-.143-.643-1.548-.88-2.12-.232-.557-.468-.48-.643-.49l-.547-.01c-.19 0-.5.071-.762.357-.262.285-1 .976-1 2.38s1.024 2.76 1.167 2.952c.143.19 2.016 3.08 4.886 4.318.683.295 1.216.471 1.631.603.685.218 1.309.187 1.802.113.55-.082 1.688-.69 1.926-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.547-.333z" />
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: "Pinterest",
    color: "#E60023",
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-7 h-7">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 5.01 3.013 9.32 7.36 11.21-.1-.93-.19-2.36.04-3.38.21-.91 1.41-5.97 1.41-5.97s-.36-.72-.36-1.79c0-1.68.97-2.93 2.18-2.93 1.03 0 1.53.77 1.53 1.7 0 1.04-.66 2.59-1 4.02-.28 1.2.6 2.18 1.78 2.18 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5.01-4.88-3.41 0-5.41 2.56-5.41 5.2 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34-.09.37-.29 1.2-.33 1.37-.05.22-.17.27-.39.16-1.49-.7-2.42-2.88-2.42-4.64 0-3.77 2.74-7.24 7.9-7.24 4.14 0 7.36 2.95 7.36 6.9 0 4.12-2.6 7.43-6.2 7.43-1.21 0-2.35-.63-2.74-1.37l-.74 2.78c-.27 1.04-1 2.34-1.49 3.13.56.17 1.15.27 1.76.27 6.627 0 12-5.373 12-12S22.627 3 16 3z" />
      </svg>
    ),
    getUrl: (url: string, title: string, image?: string) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}${image ? `&media=${encodeURIComponent(image)}` : ""}`,
  },
  {
    name: "Telegram",
    color: "#2AABEE",
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-7 h-7">
        <path d="M16 3C9.373 3 4 8.373 4 15s5.373 12 12 12 12-5.373 12-12S22.627 3 16 3zm5.89 8.11l-2.02 9.52c-.15.67-.54.84-1.09.52l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.04 5.5-4.97c.24-.21-.05-.33-.37-.12l-6.8 4.28-2.93-.91c-.64-.2-.65-.64.13-.95l11.43-4.41c.53-.19 1 .13.8.5z" />
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Snapchat",
    color: "#FFFC00",
    textColor: "#000",
    icon: (
      <svg viewBox="0 0 32 32" fill="black" className="w-7 h-7">
        <path d="M16 3c-2.97 0-6.04 1.37-7.82 3.97-.96 1.41-1.18 2.97-1.18 4.48 0 .44.03.88.06 1.32-.28.14-.59.22-.91.22-.43 0-.85-.14-1.19-.4-.1-.08-.22-.12-.34-.12-.28 0-.54.22-.54.5 0 .02 0 .04.01.06.08.56.55 1.04 1.1 1.31.07.03.14.06.21.09-.07.3-.11.62-.11.95 0 2.1 1.06 3.97 2.67 5.1-.03.04-.06.09-.06.14 0 .12.08.23.2.27.77.24 1.55.37 2.35.37.13 0 .26 0 .39-.01.55.79 1.51 1.31 2.57 1.31s2.02-.52 2.57-1.31c.13.01.26.01.39.01.8 0 1.58-.13 2.35-.37.12-.04.2-.15.2-.27 0-.05-.03-.1-.06-.14 1.61-1.13 2.67-3 2.67-5.1 0-.33-.04-.65-.11-.95.07-.03.14-.06.21-.09.55-.27 1.02-.75 1.1-1.31.01-.02.01-.04.01-.06 0-.28-.26-.5-.54-.5-.12 0-.24.04-.34.12-.34.26-.76.4-1.19.4-.32 0-.63-.08-.91-.22.03-.44.06-.88.06-1.32 0-1.51-.22-3.07-1.18-4.48C22.04 4.37 18.97 3 16 3z" />
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`,
  },
  {
    name: "Reddit",
    color: "#FF4500",
    icon: (
      <svg viewBox="0 0 32 32" fill="white" className="w-7 h-7">
        <path d="M28 16c0-1.66-1.34-3-3-3-.78 0-1.49.3-2.02.79C21.14 12.56 19.12 12 17 11.87l.87-4.1 2.84.6c.04.82.71 1.47 1.54 1.47.86 0 1.55-.69 1.55-1.55S23.11 6.74 22.25 6.74c-.6 0-1.12.34-1.38.84l-3.18-.67c-.17-.04-.34.07-.38.24l-.97 4.57c-2.18.09-4.26.65-6.07 1.9A2.99 2.99 0 007 13c-1.66 0-3 1.34-3 3 0 .99.48 1.86 1.22 2.4-.05.27-.08.54-.08.82 0 4.14 4.83 7.5 10.79 7.5s10.79-3.36 10.79-7.5c0-.28-.03-.55-.08-.82C27.52 17.86 28 16.99 28 16zm-12.21 7.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm5.42 0c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
];

const SECONDARY_CHANNELS = [
  {
    name: "Messages",
    icon: <MessageCircle className="w-6 h-6 text-[#34C759]" />,
    getUrl: (url: string, title: string) =>
      `sms:?body=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: "Email",
    icon: <Mail className="w-6 h-6 text-[#007AFF]" />,
    getUrl: (url: string, title: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this product on Thrifti: ${url}`)}`,
  },
  {
    name: "Copy Link",
    icon: <Link2 className="w-6 h-6 text-[#8E8E93]" />,
    getUrl: () => null,
  },
];

export default function ShareSheet({ open, onClose, url, title, image }: ShareSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Bottom Sheet */}
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl pb-8 pt-4 px-5 animate-slide-up"
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Share this product with friends</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Product preview card */}
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 mb-5 bg-gray-50">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--thrifti-red)] font-semibold uppercase tracking-wide mb-0.5">Thrifti</p>
            <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-3">{title}</p>
          </div>
        </div>

        {/* Primary share channels */}
        <div className="flex justify-between mb-5">
          {SHARE_CHANNELS.map((ch) => (
            <a
              key={ch.name}
              href={ch.getUrl(url, title, image)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: ch.color }}
              >
                {ch.icon}
              </div>
              <span className="text-[10px] text-gray-600 font-medium">{ch.name}</span>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-4" />

        {/* Secondary channels */}
        <div className="flex justify-around mb-4">
          {SECONDARY_CHANNELS.map((ch) => (
            ch.name === "Copy Link" ? (
              <button
                key={ch.name}
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center border border-gray-200 bg-white shadow-sm">
                  {ch.icon}
                </div>
                <span className="text-[10px] text-gray-600 font-medium">{ch.name}</span>
              </button>
            ) : (
              <a
                key={ch.name}
                href={ch.getUrl(url, title) ?? undefined}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center border border-gray-200 bg-white shadow-sm">
                  {ch.icon}
                </div>
                <span className="text-[10px] text-gray-600 font-medium">{ch.name}</span>
              </a>
            )
          ))}
          {/* More — triggers native share if available */}
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center border border-gray-200 bg-white shadow-sm">
                <span className="text-xl text-gray-500">···</span>
              </div>
              <span className="text-[10px] text-gray-600 font-medium">More</span>
            </button>
          )}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
