import { useEffect, useState } from "react";
import { Sparkles, Info, Code, ExternalLink } from "lucide-react";

interface AdPlaceholderProps {
  type: "leaderboard" | "sidebar";
  id?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

const AD_CLIENT_ID = "ca-pub-5624181902355280";
// Slot IDs copied from your AdSense snippets
const AD_SLOT_LEADERBOARD = "9789414622"; // 728x90
const AD_SLOT_SIDEBAR = "9214699557"; // 300x250

export default function AdPlaceholder({ type, id }: AdPlaceholderProps) {
  const [showIntegrationTip, setShowIntegrationTip] = useState(false);
  const insId =
    id ||
    (type === "leaderboard" ? "ad-leaderboard-wrapper" : "ad-sidebar-wrapper");

  const dataAdSlot =
    type === "leaderboard" ? AD_SLOT_LEADERBOARD : AD_SLOT_SIDEBAR;
  const width = type === "leaderboard" ? 728 : 300;
  const height = type === "leaderboard" ? 90 : 250;

  useEffect(() => {
    // Let AdSense script load (it is already in index.html) and then trigger rendering.
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense push error:", e);
    }
  }, [type, dataAdSlot]);

  return (
    <div id={insId} className="w-full flex flex-col gap-1 select-none">
      {/* Header (keep your existing UI affordance) */}
      <div className="flex items-center justify-between px-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
          {type === "leaderboard" ? "Sponsored Link" : "Sponsored Content"}
        </span>
        <button
          onClick={() => setShowIntegrationTip(!showIntegrationTip)}
          className="hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
          title="Ad integration info"
        >
          <Info className="w-3 h-3" />
          {showIntegrationTip ? "Hide Script Info" : "Snippet Setup"}
        </button>
      </div>

      {/* Real AdSense slot container */}
      <div
        className={
          type === "leaderboard"
            ? "relative overflow-hidden w-full bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between p-4 md:px-8 shadow-inner"
            : "relative overflow-hidden w-full bg-slate-100 border border-slate-300 rounded-xl flex flex-col items-center justify-between p-5 shadow-lg"
        }
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex items-center justify-center w-full">
          <ins
            className="adsbygoogle"
            // AdSense will size based on the ad unit; ins style hints help layout.
            style={{
              display: "inline-block",
              width: `${width}px`,
              height: `${height}px`,
            }}
            data-ad-client={AD_CLIENT_ID}
            data-ad-slot={dataAdSlot}
          />
        </div>

        {/* Minimal decorative text, so users don’t see an empty box */}
        <div className="relative z-10 hidden sm:flex items-center justify-between w-full mt-3">
          {type === "leaderboard" ? (
            <div className="text-center md:text-left">
              <div className="px-2.5 py-1 text-[9px] font-mono font-black border border-slate-350 bg-slate-200 text-slate-700 rounded shadow-sm tracking-widest inline-block">
                ADVERTISEMENT
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="px-2.5 py-1 text-[9px] font-mono font-black border border-slate-350 bg-slate-200 text-slate-700 rounded shadow-sm tracking-widest inline-block">
                ADVERTISEMENT
              </div>
            </div>
          )}
          <a
            href="https://adsense.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg shadow transition-all cursor-pointer"
          >
            Sponsored
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {showIntegrationTip && (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-[11px] font-mono text-slate-400 mt-1 flex flex-col gap-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-1.5">
            <span className="font-bold flex items-center gap-1 text-emerald-400">
              <Code className="w-3.5 h-3.5" /> Google AdSense {width}x{height}{" "}
              Slot
            </span>
            <span className="text-[10px] text-slate-500">
              HTML Script Insertion
            </span>
          </div>
          <p className="text-slate-450 leading-relaxed">
            This component renders your AdSense code widget element and calls{" "}
            <code>adsbygoogle.push({{}})</code>.
          </p>
          <pre className="p-2 bg-slate-950 text-amber-400 border border-slate-850 rounded text-[10px] overflow-x-auto select-all">
            {`<ins class="adsbygoogle"
     style="display:inline-block;width:${width}px;height:${height}px"
     data-ad-client="${AD_CLIENT_ID}"
     data-ad-slot="${dataAdSlot}" ></ins>`}
          </pre>
        </div>
      )}
    </div>
  );
}
