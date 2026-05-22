import { useState } from 'react';
import { Sparkles, Info, Code, ExternalLink } from 'lucide-react';

interface AdPlaceholderProps {
  type: 'leaderboard' | 'sidebar';
  id?: string;
}

export default function AdPlaceholder({ type, id }: AdPlaceholderProps) {
  const [showIntegrationTip, setShowIntegrationTip] = useState(false);

  if (type === 'leaderboard') {
    return (
      <div
        id={id || "ad-leaderboard-wrapper"}
        className="w-full flex flex-col gap-1 select-none"
      >
        <div className="flex items-center justify-between px-2 text-[10px] font-mono font-semibold text-slate-550 text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            Sponsored Link
          </span>
          <button
            onClick={() => setShowIntegrationTip(!showIntegrationTip)}
            className="hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="Ad integration info"
          >
            <Info className="w-3 h-3" />
            {showIntegrationTip ? 'Hide Script Info' : 'Snippet Setup'}
          </button>
        </div>

        <div className="relative overflow-hidden w-full min-h-[90px] md:h-[90px] bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between p-4 md:px-8 shadow-inner transition-all hover:bg-slate-100/90 group">
          {/* Subtle dotted background patterns typical of print/ad spaces */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="flex flex-col md:flex-row items-center gap-4 z-10 text-center md:text-left">
            {/* Ad Badge */}
            <div className="px-2.5 py-1 text-[9px] font-mono font-black border border-slate-350 bg-slate-200 text-slate-700 rounded shadow-sm tracking-widest">
              ADVERTISEMENT
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Master Compiler Engineering with Professional Mentors
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Ezoic & AdSense dynamic placement slot • Optimized 728x90 leaderboard ready for publisher scripts.
              </p>
            </div>
          </div>

          <div className="mt-3 md:mt-0 z-10 flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold text-slate-400 hidden lg:inline bg-slate-200/50 px-2 py-0.5 rounded border border-slate-300">
              728 x 90 Leaderboard
            </span>
            <a
              href="https://adsense.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg shadow transition-all cursor-pointer"
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
                <Code className="w-3.5 h-3.5" /> Google AdSense Leaderboard Slot
              </span>
              <span className="text-[10px] text-slate-500">HTML Script Insertion</span>
            </div>
            <p className="text-slate-450 leading-relaxed">
              To go live, replace this container node with your custom AdSense publisher token script:
            </p>
            <pre className="p-2 bg-slate-950 text-amber-400 border border-slate-850 rounded text-[10px] overflow-x-auto select-all">
{`<ins className="adsbygoogle"
     style={{ display: "inline-block", width: "728px", height: "90px" }}
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890" />`}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Sidebar Ad Placement (300x250)
  return (
    <div
      id={id || "ad-sidebar-wrapper"}
      className="w-full flex flex-col gap-1 select-none"
    >
      <div className="flex items-center justify-between px-1 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
          Sponsored Content
        </span>
        <button
          onClick={() => setShowIntegrationTip(!showIntegrationTip)}
          className="hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
          title="Ad setup instructions"
        >
          <Code className="w-3.5 h-3.5" />
          {showIntegrationTip ? 'Hide Script' : 'Setup Script'}
        </button>
      </div>

      <div className="relative overflow-hidden w-full h-[250px] bg-slate-100 border border-slate-300 rounded-xl flex flex-col items-center justify-between p-5 text-center shadow-lg transition-all hover:bg-slate-50 group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="flex flex-col items-center gap-3">
          <div className="px-2.5 py-1 text-[9px] font-mono font-black border border-slate-350 bg-slate-200 text-slate-700 rounded shadow-sm tracking-widest">
            ADVERTISEMENT
          </div>
          
          <div className="w-12 h-12 bg-slate-200 border border-slate-305 rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              Boost Workspace Performance with Compiler Tools
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Monetize compiler utilities easily using standard Google Ezoic sidebar banners.
            </p>
          </div>
        </div>

        <div className="w-full mt-3 flex flex-col gap-2">
          <div className="text-[10px] font-mono font-bold text-slate-400">
            300 x 250 Medium Rectangle
          </div>
          <a
            href="https://www.ezoic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer w-full"
          >
            Get Optimization Tools
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {showIntegrationTip && (
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono text-slate-400 mt-1 flex flex-col gap-1 animate-fadeIn">
          <span className="font-bold text-slate-300">Sidebar Script Integration:</span>
          <p className="text-slate-500 leading-tight">
            Replace this React component with your Google AdSense code widget element:
          </p>
          <pre className="p-1.5 bg-slate-950 text-emerald-400 border border-slate-850 rounded text-[9.5px] overflow-x-auto select-all">
{`<ins className="adsbygoogle"
     style={{ display: "block" }}
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="9876543210"
     data-ad-format="auto"
     data-full-width-responsive="true" />`}
          </pre>
        </div>
      )}
    </div>
  );
}
