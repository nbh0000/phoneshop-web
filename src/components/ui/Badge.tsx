import { cn } from "./Button";

const tone: Record<string, string> = {
  오늘특가: "bg-accent text-white",
  재고소량: "bg-danger/15 text-danger border border-danger/40",
  사전예약: "bg-accent-2/15 text-accent-2 border border-accent-2/40",
};

export function Badge({ label, className }: { label: string; className?: string }) {
  if (!label) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold tracking-tight",
        tone[label] || "bg-bg-3 text-fg-2 border border-line-2",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function CarrierChip({ carrier }: { carrier: string }) {
  const c: Record<string, string> = {
    SKT: "text-[#ff6a3d]",
    KT: "text-[#4fd1ff]",
    "LGU+": "text-[#ff4da6]",
  };
  return <span className={cn("font-bold", c[carrier] || "text-fg")}>{carrier}</span>;
}
