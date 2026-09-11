export function SectionTitle({
  eyebrow,
  title,
  desc,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
      <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{title}</h2>
      {desc && <p className="mt-2 text-sm text-fg-2 sm:text-base">{desc}</p>}
    </div>
  );
}
