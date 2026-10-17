import { useEffect, useRef } from "react";

interface AdSlotProps {
  slotId?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export default function AdSlot({
  slotId,
  format = "auto",
  responsive = true,
  className = "",
  label = "Advertisement",
}: AdSlotProps) {
  const pushedRef = useRef(false);
  const client = import.meta.env.VITE_ADSENSE_CLIENT ?? "ca-pub-4991947741196600";
  const resolvedSlotId = slotId ?? import.meta.env.VITE_ADSENSE_SLOT_ID;

  useEffect(() => {
    if (!resolvedSlotId || pushedRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (error) {
      console.warn("AdSense slot could not initialize.", error);
    }
  }, [resolvedSlotId]);

  if (!resolvedSlotId) return null;

  return (
    <aside className={`ad-slot ${className}`} aria-label={label}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={resolvedSlotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </aside>
  );
}
