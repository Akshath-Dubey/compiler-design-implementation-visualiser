import { useEffect } from "react";

interface AdProps {
  slot: string;
  format?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdSenseCard = ({ slot, format = "auto" }: AdProps) => {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense tracking error:", e);
    }
  }, [slot, format]);

  return (
    <div className="my-4 mx-auto flex flex-col items-center justify-center border border-dashed border-gray-600 p-2 bg-gray-900/50 rounded-lg max-w-full overflow-hidden">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
        Advertisement
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5624181902355280"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
